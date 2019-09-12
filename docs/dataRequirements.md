Data Requirements
=================
Each of the following categories below corresponds to a distinct table of collected data.


# **DR.UID** User identification table
## Privacy
- Data is private (contains email addresses)
- Connected to other tables via random ID

## Why we need it now
- For contact about future studies (participation and/or data reuse)
- So that we can identify participants' data in the event that they request corrections or its removal (e.g. GDPR)

## What
- email address
- random ID
- contact preferences:
  - Notifications about when their public responses have been added
  - Contact about our future research activities (i.e. when we add more surveys to the system)
  - Contact about external research opportunities (i.e. we would forward external researcher contact info to the participant)


# **DR.DAS** Data abstraction summaries
## Privacy
- Data is public; no identifying information
- Connected to other tables via random ID

## Why we need it now
- Basis for ETS
- WTB.1

## What
1. User thinks of any real or hypothetical dataset (OR, one of us references a specific design study that we're summarizing)
2. Selects a subset of four broad types that "describe how you normally think about" the dataset:
  - Tabular
  - Network / Hierarchy
  - Spatial / Temporal
  - Textual
  - Other
3. For each type identified:
  - Answer specific questions about the dataset's nuances in context of each type
  - Manually enter a very small, fake example of what the dataset would look like from that perspective
4. Answer specific questions that apply across data types, e.g. what kinds of attributes exist


# **DR.ETS** External (inter-abstraction) transformation summaries
## Privacy
- Data is public; no identifying information
- Connected to other tables via random ID

## Why we need it now
- WTB.2
- TVR.1

## What
For each of the four broad types that *didn't* "describe how you normally think about" the dataset, repeat step 3 of **DR.DAS**


# **DR.JTM** Jargon translation maps
## Privacy
- Data is public; no identifying information
- Connected to other tables via random ID

## Why we're piloting it now
- Already having this data will be important for DR.FTC and DR.CUE
- WTB.3
- TVR.2

## What
- Throughout all activities, CS jargon will be presented, and users will be encouraged (**todo:** how?) to choose more appropriate terms for their domain


# [future work] **DR.ITS** Internal (intra-abstraction) transformation summaries
## Privacy
- Data is public; no identifying information
- Connected to other tables via random ID

## What
  - (beginning with a data abstraction summary of their own, that includes at least one of the four non-Other dataset types)


# [future work] **DR.FTC** Familiar tool classifications
## Privacy
- Data is private; although no identifying information will be collected, reporting this data in aggregate should be sufficient
- Connected to other tables via random ID (necessary? Maybe for identifying familiarity of a tool by domain?)

## What
- Users will Likert-rate a selected sample of software tools that other users have identified, w.r.t:
  - personal familiarity with the tool
  - perceived relevance to the particular data abstraction or transformation
  - usability
  - expressiveness
- Submit names of other tools that they use (or could imagine using) with a particular data abstraction or data transformation


# [future work] **DR.CQE** Creative Question Evaluations
- Data is private; although no identifying information will be collected, reporting this data in aggregate should be sufficient
- Connected to other tables via random ID (necessary? Maybe for identifying novelty of an abstraction by domain?)

## What
- At the end of each activity, users will ... **todo: how to assess whether an activity provoked new question(s)?**
- Ask users to Likert-rate the extent to which the survey caused them to think about their data differently? How to word "differently"?


# [future work] **DR.CUE** Conceptual Understanding Evaluations
## Privacy
- Data is private; although no identifying information will be collected, reporting this data in aggregate should be sufficient
- Connected to other tables via random ID (necessary? Maybe for identifying familiarity of a term by domain?)

## What
- At the end of each activity, users will take a short conceptual quiz, matching random subset of terms to the corresponding definition (use the translated version if the user specified one)
