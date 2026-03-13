# Build Log

> Timer started: [10:45]
> Timer ended: [HH:MM]
> Total time: [X hrs Y mins]

## Log

### [10:45] Started — reading prompt.

### [11:00] It took me longer to understand the requirements, but I think I have an idea. 

### [11:15] Filled out the REQUIREMENTS.md file with what I will attempt to build 

### [11:35] Researching the api.grants.gov API 
https://grants.gov/api/api-guide
https://wiki.simpler.grants.gov/product/api

Second link needs authentication so I skipped the newer API

- POST https://api.grants.gov/v1/api/search2 : the search endpoint. Works with just a JSON body, returns basic grant info (id, title, agency, dates, status).

The above API doesn't return the grant details so I needed to find another way without authentication.

- POST https://apply07.grants.gov/grantsws/rest/opportunity/details : the legacy detail endpoint. Works with form-encoded oppId=<id>, returns full details including synopsis, award amounts, etc.

The above API is old but is working for this use case.

Claude code was extremely helpful in finding out this information!

- Manually testing APIs from POSTMAN

### [12:00]
Installed dependencies:
- NextJS
- Shadcn-ui
- Prisma ORM
- Sqllite3
- Anthropic API (also generated an API key)

Built the prisma schema:
- OrgProfile
- SavedGrant

Added enums for PipelineStatus 

### [12:30] 
- Created the APIs for loading and saving profile
- Claude code did this for me

### [12:45] 
- Created the APIs for grants
- Claude code did this for me, including some seed data
- Tested endpoints
- Made sure the build succeeds

### [13:00]
- Testing endpoints 

### [00:XX] Build passing

### [00:XX] Deployed

### [00:XX] Submitted

---

## Blockers & How I Resolved Them
- I had to open it up the assessment in a different browser because Safari didn't have the links working!
- Took a while to find the correct APIs at grants.gov (Claude was helpful with this)
- 

## If I Had 30 More Minutes
- Implement drag and drop on the kanban board
- Made the UI better (dropdowns and buttons are using native components and not shadcn components)

## If I Had 60 More Minutes
- Implement a real persistant database
- implement real auth

## If I Had 8 more Hours
- Implement multi-tenant
