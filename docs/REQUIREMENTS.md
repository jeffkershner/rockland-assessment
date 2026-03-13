# Requirements

## Problem Statement
Based on what I understand about the back and forth conversation, grant managers
spend 4-6 hours per week searching for grants and cross many different systems.

They waste time pursuing grants that were never a good fit. 

## Core User Stories
- I will build a simple dashboard that can search the government grants for keywords
- From those results, I will have a score with AI to see if that grant matches the company profile
- Grants can be added to a kanban type board for further evaluation

## Scope
### In Scope
- Dashboard with a few grants already added
- Ability to search grants.gov for grants matching keywords
- Ability to score grants by profile for potential good fits

### Out of Scope
- The dashboard is simple by nature to fit in the 3 hour dev window
- SQLlite is used (file based), and will not persist when Vercel shutdowns the edge and does a cold start
- Authentication
- multi-tenant

## Assumptions
Based on what I read in the conversation, I assume the following:
- Dashboard should be immediately understood even by non-technical people
- No deep clicking, CEO should be able to see what is going on at a glance

## Data Model
Super simple data model as there are only 2 tables
- OrgProfile keeps information about the facility and what they do
- SavedGrant is just a grant that was save after found
- Some status enum types for type checking

Everything else is ephemeral
