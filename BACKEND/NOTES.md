# Step 1 
npm install
npm run dev
if needed - npm install --save-dev wrangler@latest
            npx wrangler dev

# Step 2
name = "skill-api"
compatibility_date = "2023-12-01"

[[d1_databases]]
binding = "DB"
database_name = "skillxchange-db"
database_id = "375d6370-0803-4335-ab28-1091a74f4613"


# Migration
-npx wrangler d1 execute skillxchange-db --file ./migrations/init.sql

-  npx wrangler d1 execute skillxchange-db --file=./Schema/schema.db.sql

-  npx wrangler d1 migrations apply skillxchange-db

-  npx wrangler d1 migrations apply skillxchange-db --env production --remote  (Run migrations on production)

-  npx wrangler d1 migrations apply skillxchange-db --remote



✅ users table
Stores user accounts.

Column	  Type	        Purpose
user_id	   VARCHAR(50)	Unique ID for the user (PK)
username	VARCHAR(50)	Unique username
email	    VARCHAR(100)	Unique email
password	VARCHAR(100)	Hashed password (ideally)


✅ skills table
Stores different types of skills available.

Column	Type	Purpose
skill_id	TEXT	Unique ID of skill (PK)
name	VARCHAR(100)	Name of the skill (must be unique)
description	TEXT	Description of the skill



✅ user_skills table
Many-to-many relationship between users and skills.

Column	Type	Purpose
user_id	VARCHAR(50)	FK to users.user_id
skill_id	VARCHAR(50)	FK to skills.skill_id
rating	INTEGER	How skilled the user is (self or reviewed)
Composite PK: (user_id, skill_id) ensures a user can't add the same skill twice.


✅ requests table
When one user requests a skill from another user.

Column	Type	Purpose
id	INTEGER	Auto-increment primary key
requester_id	VARCHAR(50)	FK to users.user_id (who’s asking)
receiver_id	VARCHAR(50)	FK to users.user_id (who’s being asked)
skill_id	VARCHAR(50)	FK to skills.skill_id
message	TEXT	Custom message
status	TEXT	Default 'pending', can be 'approved', 'rejected'



✅ newrequest table
Like requests, but allows two-way skill exchange.

Column	Type	Purpose
id	   INTEGER   	Auto-increment PK
requester_id	VARCHAR(50)	FK to users.user_id
receiver_id  	VARCHAR(50)	FK to users.user_id
receiver_skill_id	VARCHAR(50)	Skill the receiver offers (FK)
user_skill_id	VARCHAR(50)	Skill the requester offers (FK)
message	TEXT	Message attached to request
status	TEXT	Default 'pending', can be 'approved', 'rejected'