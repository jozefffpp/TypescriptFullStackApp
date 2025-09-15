TRUNCATE test."user" CASCADE;
TRUNCATE test."organization" CASCADE;

-- 200 users
INSERT INTO test."user" (name, email, features, language_code, timezone_id, country_id, locale_id)
  (
    SELECT DISTINCT ON (s)
      CONCAT('name-', s::TEXT),
      CONCAT('name-', s::TEXT, '@domain', s::TEXT, '.com'),
      '{}'::JSONB,
      lang.code,
      tz.id,
      c.id,
      loc.id
    FROM GENERATE_SERIES(0, 200) s
      CROSS JOIN test.languages lang
      CROSS JOIN test.timezones tz
      CROSS JOIN test.countries c
      CROSS JOIN test.locales loc
    ORDER BY s, RANDOM()
    LIMIT 200
  );

-- 2000 organizations
INSERT INTO test."organization" (name, country_id, features, timezone_id)
  (
    SELECT DISTINCT ON (s)
      CONCAT('org-', s::TEXT),
      c.id,
      '{}'::JSONB,
      tz.id
    FROM GENERATE_SERIES(0, 2000) s
      CROSS JOIN test.timezones tz
      CROSS JOIN test.countries c
    ORDER BY s, RANDOM()
    LIMIT 2000
  );

-- Each user has approximately 10 organizations
INSERT INTO test.organization_user (user_id, organization_id)
  (
    SELECT u.id, o.id
    FROM test."user" u
      JOIN test.organization o ON (RANDOM() <= 0.005) -- 10 / 2000
  );

-- 2 users have permissions to all organizations
INSERT INTO test.organization_user (user_id, organization_id)
  (
    SELECT u.id, o.id
    FROM test.organization o
      CROSS JOIN (
      SELECT id
      FROM test."user"
      ORDER BY RANDOM()
      LIMIT 2
    ) u
  )
ON CONFLICT DO NOTHING;



TRUNCATE test."team" CASCADE;
INSERT INTO test."team" (name, organization_id)
  (
    SELECT
      CONCAT('team-', id),
      o.id
    FROM test.organization o
    ORDER BY RANDOM()
    LIMIT 1000
  );

INSERT INTO test.team_user (user_id, team_id)
  (
    SELECT
      u.id, t.id
    FROM test."user" u
    JOIN test.organization_user ou ON u.id = ou.user_id
    JOIN test.team t ON (t.organization_id = ou.organization_id)
  );

INSERT INTO test.scenario_folder (name, team_id)
  (
    SELECT
      concat('scenario-folder-', t.id), t.id
    FROM test.team t
  );

TRUNCATE test.scenario;
INSERT INTO test.scenario (name, description, team_id, scenario_folder_id, configuration, active, scheduling)
  (
    SELECT DISTINCT ON (s)
      concat('name', s),
      concat('description', s),
      t.id,
      sf.id,
      '{}'::JSONB,
      s % 2 = 0,
      '{}'::JSONB
    FROM GENERATE_SERIES(0, 2000) s
    CROSS JOIN test.team t
    JOIN test.scenario_folder sf ON t.id = sf.team_id
    ORDER BY s, RANDOM()
  );
