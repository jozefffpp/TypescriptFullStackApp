# BE Tasks

## NodeJs

### 1. Easy Mode <img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/209/cat-face_1f431.png" width="30" height="30">
- [x] 1.1 Improve server application
  - It's supposed to be fully functional and ready to go out-of-the-box (batteries included mindset). If there are some additional commands needed to make it ready, please document them
- [x] 1.2 Create application bootstrap 
  - initialize services before the server starts. Use bootstrap for seeding a `server/storage/db.json` with the data from GET 'https://hook.eu1.integromat.com/10r7cd1lcwve9j241i98k1f3nn4o3j8g'
- [x] 1.3 Create the endpoints below. For the requests use same interfaces as the requests in `src/app/cats/cats.service.ts`. As a storage please use `server/storage/db.json`.
  - [x] 1.3.1 Endpoint which returns random cat from the `server/storage/db.json`
  - [x] 1.3.2 Endpoint which returns whole list of the cats from `server/storage/db.json`
  - [x] 1.3.3 Endpoint which updates rating of the single cat `server/storage/db.json`

### 2. Normal Mode <img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/209/ninja-cat_1f431-200d-1f464.png" width="30" height="30">
- [x] 2.1 Create the endpoints below
  - [x] 2.1.1 Endpoint which uploads a new cat (image, name) in `multipart/form-data` and stores metadata to `server/storage/db.json` and image to `server/storage/images`
- [x] 2.2 Update upload endpoint to accept multiple files and optimize the processing to do not slow down the app
- [x] 2.3 Limit max size of the `multipart/form-data` payload (sum of) to 10MB
- [x] 2.4 Implement API key authentication
- [x] 2.5 Create a middleware which prevents CSRF attacks

### 3. Hardcore Mode <img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/microsoft/209/dino-cat_1f431-200d-1f409.png" width="30" height="30">
 - [x] 3.1 It seems the app has memory leak, please try to find that and fix it

## PostgreSQL
### 1. Prepare DB ~done
- use sql [dump](../sql/dump.sql)
- use sql [content](../sql/content.sql)
- see the db [model](../sql/model.png)

### 2. Seed the database with test fixtures ~done
   - 200 users
   - 2000 organizations
   - Each user has approximately 10 organizations
   - 2 users have permissions to all organizations

### 3. Create function for listing users ~done
   - with output properties: `id`, `email`, `name`, `timezone_id`, `country_id`, `locale_id`, `organizations_count`, `scenarios_count`, `active_scenarios_count`, `organizations_with_scenario`
   		- `organizations_count` – total amount of organizations where user is a member
   		- `scenarios_count` – the total number of scenarios from all teams where user is a member
   		- `active_scenarios_count` – the total number of scenarios where attribute `active` is true from all teams where user is a member
   		- `organizations_with_scenario` – the array of organization IDs where the user has at least one scenario
   - Option of pagination by input parameters:
   		- `pagination_limit` (default value 50)
   		- `pagination_offset`
   - Option of sorting by input parameters:
   		- `sort_by` (`id` - default value, `name`, `organizations_count`)
   		- `sort_dir` (ASC - default value, DESC).
   - *OPTIONAL*: Option of filtering by the input parameters:
   		- `filter_id` - returns only one specific user with the given id
   		- `filter_name` - returns users where name matches regular expression in `filter_name`
   		- `filter_organization_id` - returns users who belong to the `organization_id`

### 4. Create function for editing user ~done
   - with input properties:
   		- `id integer` - id of the edited user
   		- `payload json` - data to be changed. It is possible to edit:
			- `email`
   			- `name`
   			- `timezone_id`
   			- `country_id`
   		- If any of the listed values are missing in the `payload json` object, the values do not change.
        - The output from this function will be the same as the output from the function from point 3 (it will be only one record).

