\set ON_ERROR_STOP 0
\set QUIET 1
-- users
insert into auth.users values ('00000000-0000-0000-0000-00000000000a','admin@x.com'),('00000000-0000-0000-0000-00000000000e','ed@x.com'),('00000000-0000-0000-0000-00000000000c','con@x.com'),('00000000-0000-0000-0000-00000000000f','nobody@x.com');
-- bootstrap from "SQL editor" (no auth.uid)
update public.profiles set role='admin' where email='admin@x.com';
update public.profiles set role='editor' where email='ed@x.com';
update public.profiles set role='contributor' where email='con@x.com';
select 'T1 profiles created by trigger + bootstrap' as test, count(*) filter (where role is not null) = 3 as pass from public.profiles;

-- seed content as admin
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
insert into public.reviews (slug,title,product_name,status,published_at,overall_rating,rating_approved,body) values
 ('live-one','Live one','P1','published', now() - interval '1 day', 8.2, true, 'x'),
 ('future-one','Future one','P2','scheduled', now() + interval '1 day', 7.0, true, 'x'),
 ('past-sched','Past scheduled','P3','scheduled', now() - interval '1 hour', 6.0, true, 'x'),
 ('draft-one','Draft one','P4','draft', null, null, false, 'x'),
 ('unpub','Unpublished','P5','unpublished', now() - interval '2 day', 5.0, true, 'x');
reset role; reset request.jwt.claim.sub;

-- anon visibility
set role anon;
select 'T2 anon sees only live (live-one, past-sched)' as test, string_agg(slug, ',' order by slug) = 'live-one,past-sched' as pass from public.reviews;
select 'T3 anon can read categories' as test, count(*) = 10 as pass from public.categories;
insert into public.submissions (kind, message) values ('contact','hello there');
select 'T4 anon cannot read submissions after inserting' as test, count(*) = 0 as pass from public.submissions;
reset role;
select 'T4b submission was stored' as test, count(*) = 1 as pass from public.submissions;

-- no-role user
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000f';
select 'T5 no-role user sees only live' as test, count(*) = 2 as pass from public.reviews;
do $$ begin insert into public.reviews (slug,title,product_name) values ('nope','Nope','x'); raise notice 'FAIL T6'; exception when others then raise notice 'PASS T6 no-role insert blocked: %', sqlerrm; end $$;
do $$ begin update public.profiles set role='admin' where id = auth.uid(); if exists(select 1 from public.profiles where id=auth.uid() and role='admin') then raise notice 'FAIL T7'; else raise notice 'PASS T7 (no rows updatable)'; end if; exception when others then raise notice 'PASS T7 self-promotion blocked: %', sqlerrm; end $$;
reset role;

-- contributor
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
select 'T8 contributor sees drafts' as test, count(*) = 5 as pass from public.reviews;
insert into public.reviews (slug,title,product_name,created_by) values ('con-draft','Contrib draft','X', auth.uid());
select 'T9 contributor can create draft' as test, count(*) = 1 as pass from public.reviews where slug='con-draft';
do $$ begin update public.reviews set status='published', published_at=now(), overall_rating=9, rating_approved=true where slug='con-draft'; if exists (select 1 from public.reviews where slug='con-draft' and status='published') then raise notice 'FAIL T10'; else raise notice 'PASS T10 (no rows)'; end if; exception when others then raise notice 'PASS T10 contributor publish blocked: %', sqlerrm; end $$;
do $$ begin insert into public.reviews (slug,title,product_name,status,published_at,overall_rating,rating_approved,created_by) values ('sneaky','Sneaky','X','published',now(),9,true,auth.uid()); raise notice 'FAIL T11'; exception when others then raise notice 'PASS T11 contributor insert-as-published blocked: %', sqlerrm; end $$;
do $$ begin update public.reviews set title='hacked' where slug='live-one'; if exists (select 1 from public.reviews where title='hacked') then raise notice 'FAIL T12'; else raise notice 'PASS T12 contributor cannot edit live review'; end if; end $$;
do $$ begin update public.reviews set overall_rating=7.5 where slug='con-draft'; raise notice 'PASS T13 contributor can edit own draft'; exception when others then raise notice 'FAIL T13 %', sqlerrm; end $$;
do $$ begin delete from public.reviews where slug='live-one'; if exists (select 1 from public.reviews where slug='live-one') then raise notice 'PASS T14 contributor cannot delete'; else raise notice 'FAIL T14'; end if; end $$;
reset role;

-- editor
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000e';
do $$ begin update public.reviews set status='published', published_at=now() where slug='draft-one'; raise notice 'FAIL T15'; exception when others then raise notice 'PASS T15 cannot publish without approved score: %', sqlerrm; end $$;
do $$ begin update public.reviews set status='published', published_at=now(), overall_rating=6.6, rating_approved=true where slug='draft-one'; raise notice 'PASS T16 editor publishes with approved score'; exception when others then raise notice 'FAIL T16 %', sqlerrm; end $$;
do $$ begin update public.reviews set overall_rating=10.5 where slug='draft-one'; raise notice 'FAIL T17'; exception when others then raise notice 'PASS T17 score >10 rejected'; end $$;
do $$ begin update public.reviews set is_sponsored=true where slug='draft-one'; raise notice 'FAIL T18'; exception when others then raise notice 'PASS T18 sponsored needs disclosure'; end $$;
do $$ begin insert into public.site_settings(key,value) values ('x','{}'); raise notice 'FAIL T19'; exception when others then raise notice 'PASS T19 editor cannot write settings'; end $$;
insert into public.review_updates (review_id, note) select id, 'Retested' from public.reviews where slug='draft-one';
reset role;

reset request.jwt.claim.sub;
set role anon;
select (select count(*) from public.reviews) as r_dbg, (select count(*) from public.review_updates) as u_dbg;
select 'T20 anon sees newly published + its update note' as test, (select count(*) from public.reviews)=3 and (select count(*) from public.review_updates)=1 as pass;
reset role;

-- admin settings + storage
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
update public.site_settings set value='{"youtube":"https://youtube.com/@x"}' where key='social';
select 'T21 admin writes settings' as test, value->>'youtube' is not null as pass from public.site_settings where key='social';
insert into storage.objects (bucket_id, name) values ('media','a.jpg');
reset role;
set role authenticated; set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000f';
do $$ begin insert into storage.objects (bucket_id, name) values ('media','evil.jpg'); raise notice 'FAIL T22'; exception when others then raise notice 'PASS T22 no-role cannot upload'; end $$;
reset role;
-- search
select 'T23 full-text search works' as test, count(*) >= 1 as pass from public.reviews where search @@ websearch_to_tsquery('english','live');
