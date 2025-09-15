CREATE OR REPLACE FUNCTION test.get_users_with_scenarios(
    pagination_limit INT DEFAULT 50,
    pagination_offset INT DEFAULT 0,
    sort_by VARCHAR DEFAULT 'id',
    sort_dir VARCHAR DEFAULT 'ASC',
    filter_id INT DEFAULT NULL,
    filter_name VARCHAR DEFAULT NULL,
    filter_organization_id INT DEFAULT NULL
)
RETURNS TABLE (
    id INT,
    email VARCHAR,
    name VARCHAR,
    timezone_id SMALLINT,
    country_id SMALLINT,
    locale_id SMALLINT,
    organizations_count BIGINT,
    scenarios_count BIGINT,
    active_scenarios_count BIGINT,
    organizations_with_scenario INTEGER[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    -- The variables to store the sort order and column
sort_query TEXT;
    filter_query TEXT;
BEGIN
    -- Set the sort order and column dynamically to prevent SQL injection
CASE sort_by
        WHEN 'name' THEN sort_query := 'ORDER BY u.name ' || sort_dir;
WHEN 'organizations_count' THEN sort_query := 'ORDER BY organizations_count ' || sort_dir;
ELSE sort_query := 'ORDER BY u.id ' || sort_dir;
END CASE;

    -- Set the filter clause dynamically to prevent SQL injection
    filter_query := 'WHERE 1=1';
    IF filter_id IS NOT NULL THEN
        filter_query := filter_query || ' AND u.id = ' || filter_id;
END IF;
    IF filter_name IS NOT NULL THEN
        filter_query := filter_query || ' AND u.name ~* ' || quote_literal(filter_name);
END IF;
    IF filter_organization_id IS NOT NULL THEN
        filter_query := filter_query || ' AND u.id IN (SELECT user_id FROM test.organization_user WHERE organization_id = ' || filter_organization_id || ')';
END IF;

    -- Execute the dynamic query to get the final results
RETURN QUERY EXECUTE '
        SELECT
            u.id,
            u.email,
            u.name,
            u.timezone_id,
            u.country_id,
            u.locale_id,
            COALESCE(org_counts.organizations_count, 0) AS organizations_count,
            COALESCE(scenarios_counts.scenarios_count, 0) AS scenarios_count,
            COALESCE(active_scenarios_counts.active_scenarios_count, 0) AS active_scenarios_count,
            COALESCE(orgs_with_scenarios.organizations_with_scenario, ''{}''::INTEGER[]) AS organizations_with_scenario
        FROM
            test."user" u
        LEFT JOIN (
            SELECT
                user_id,
                COUNT(*) AS organizations_count
            FROM
                test.organization_user
            GROUP BY
                user_id
        ) AS org_counts ON u.id = org_counts.user_id
        LEFT JOIN (
            SELECT
                ou.user_id,
                COUNT(s.id) AS scenarios_count
            FROM
                test.organization_user ou
            JOIN
                test.team t ON ou.organization_id = t.organization_id
            JOIN
                test.scenario s ON t.id = s.team_id
            GROUP BY
                ou.user_id
        ) AS scenarios_counts ON u.id = scenarios_counts.user_id
        LEFT JOIN (
            SELECT
                ou.user_id,
                COUNT(s.id) AS active_scenarios_count
            FROM
                test.organization_user ou
            JOIN
                test.team t ON ou.organization_id = t.organization_id
            JOIN
                test.scenario s ON t.id = s.team_id
            WHERE
                s.active = TRUE
            GROUP BY
                ou.user_id
        ) AS active_scenarios_counts ON u.id = active_scenarios_counts.user_id
        LEFT JOIN (
            SELECT
                ou.user_id,
                ARRAY_AGG(DISTINCT ou.organization_id) AS organizations_with_scenario
            FROM
                test.organization_user ou
            JOIN
                test.team t ON ou.organization_id = t.organization_id
            JOIN
                test.scenario s ON t.id = s.team_id
            GROUP BY
                ou.user_id
        ) AS orgs_with_scenarios ON u.id = orgs_with_scenarios.user_id
        ' || filter_query || '
        ' || sort_query || '
        LIMIT ' || pagination_limit || ' OFFSET ' || pagination_offset;
END;
$$;
