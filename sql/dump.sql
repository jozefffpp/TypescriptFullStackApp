create schema test;

create table test.languages
(
	code char(2) not null
	    constraint languages_pkey
	        primary key,
	name varchar not null
);

create table test.timezones
(
	id smallint not null
	    constraint timezones_pkey
	        primary key,
	name varchar not null
);

create table test.locales
(
	id smallint not null
		constraint locales_pkey
			primary key,
	name varchar not null,
	code varchar not null
		constraint locales_code_uniq
			unique
);

create table test.countries
(
	id smallint not null
		constraint countries_pkey
			primary key,
	name varchar(80),
	code varchar(5)
		constraint countries_code_uniq
			unique,
	default_language char(2) not null
		constraint countries_default_language_fkey
			references test.languages,
	default_locale varchar not null
		constraint countries_default_locale_fkey
			references test.locales (code)
);

create table test."user"
(
	id serial not null
	    constraint user_pkey
	        primary key,
	name varchar(250),
	email varchar(60) not null constraint email_unique unique,
	features jsonb,
	language_code char(2) default 'en'::bpchar not null
		constraint user_language_code_fkey
			references test.languages,
	timezone_id smallint default 1
		constraint user_timezone_fkey
			references test.timezones,
	country_id smallint not null
		constraint user_country_id_fkey
			references test.countries,
	locale_id smallint not null
		constraint user_locale_id_fkey
			references test.locales,
	created timestamp with time zone default now() not null,
	last_login timestamp with time zone
);

create table test.organization
(
	id serial not null
		constraint organization_pkey
			primary key,
	name varchar(128) not null,
	country_id smallint not null
		constraint organization_country_id_fkey
			references test.countries,
	created timestamp with time zone default now() not null,
	operations integer default 0,
	features jsonb,
	timezone_id smallint not null
		constraint organization_timezone_id_fkey
			references test.timezones
);

create table test.organization_user
(
	user_id integer not null
		constraint organization_user_user_id_fkey
			references test."user",
	organization_id integer not null
		constraint organization_user_organization_id_fkey
			references test.organization,
	constraint organization_user_pkey
		primary key (user_id, organization_id)
);

create table test.team
(
	id serial not null
		constraint team_pkey
			primary key,
	name varchar(128) not null,
	created timestamp with time zone default now() not null,
	organization_id integer not null
		constraint team_organization_id_fkey
			references test.organization
);

create table test.team_user
(
	user_id integer not null
		constraint team_user_user_id_fkey
			references test."user",
	team_id integer not null
		constraint team_user_team_id_fkey
			references test.team,
	constraint team_user_pkey
		primary key (user_id, team_id)
);

create table test.scenario_folder
(
	id serial not null
		constraint scenario_folder_pkey
			primary key,
	name varchar(100) not null,
	team_id integer not null
		constraint scenario_folder_team_id_fkey
			references test.team
);

create table test.scenario
(
	id serial not null
		constraint scenario_pkey
			primary key,
	name varchar(120) not null,
	description varchar(255) not null,
	created timestamp with time zone default now() not null,
	team_id integer
		constraint scenario_team_id_fkey
			references test.team,
	scenario_folder_id integer
		constraint scenario_scenario_folder_id_fkey
			references test.scenario_folder,
	configuration jsonb not null,
	active boolean default false,
	scheduling json not null
);


INSERT INTO test.languages (code, name) VALUES ('cs', 'Czech');
INSERT INTO test.languages (code, name) VALUES ('sk', 'Slovak');
INSERT INTO test.languages (code, name) VALUES ('en', 'English');
INSERT INTO test.languages (code, name) VALUES ('fr', 'French');

INSERT INTO test.timezones (id, name) VALUES (1, 'Asia/Dubai');
INSERT INTO test.timezones (id, name) VALUES (2, 'Asia/Kabul');
INSERT INTO test.timezones (id, name) VALUES (3, 'Europe/Andorra');
INSERT INTO test.timezones (id, name) VALUES (4, 'Europe/Berlin');
INSERT INTO test.timezones (id, name) VALUES (5, 'Europe/Paris');
INSERT INTO test.timezones (id, name) VALUES (6, 'Europe/Prague');
INSERT INTO test.timezones (id, name) VALUES (7, 'Europe/Tirane');

INSERT INTO test.locales (id, name, code) VALUES (1, 'Czech', 'cs');
INSERT INTO test.locales (id, name, code) VALUES (2, 'Slovak', 'sk');
INSERT INTO test.locales (id, name, code) VALUES (3, 'French', 'fr');
INSERT INTO test.locales (id, name, code) VALUES (4, 'English (United States)', 'en-us');

INSERT INTO test.countries (id, name, code, default_language, default_locale) VALUES (1, 'Czech Republic', 'CZE', 'cs', 'cs');
INSERT INTO test.countries (id, name, code, default_language, default_locale) VALUES (2, 'Slovak Republic', 'SVK', 'en', 'sk');
INSERT INTO test.countries (id, name, code, default_language, default_locale) VALUES (3, 'France', 'FRA', 'en', 'fr');
INSERT INTO test.countries (id, name, code, default_language, default_locale) VALUES (4, 'Norway', 'NOR', 'en', 'en-us');
INSERT INTO test.countries (id, name, code, default_language, default_locale) VALUES (5, 'Armenia', 'ARM', 'en', 'en-us');




