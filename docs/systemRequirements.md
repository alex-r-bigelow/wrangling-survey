# Explicit survey data we want to collect

## **DAS** Data abstraction summaries
### Why
- Basis for ETS, ITS
- Needed for DSW.C1, WTB.C1
- Potentially helps with DSW.N1, DSW.N2, VTD.N1, VDSR.N1, VDSR.N2

### What
- User thinks of any real or hypothetical dataset (OR, one of us references a specific design study that we're summarizing)
- Selects a subset of four broad types that "best describe" the dataset:
  - Tabular
  - Network / Hierarchy
  - Spatial / Temporal
  - Textual
  - Other
- For each type identified:
  - Answer specific questions about that data type's nuances
  - manually enter a very small, fake example of what that dataset would look like from that perspective
- Answer specific questions that apply across data types, e.g. what kinds of attributes exist

## **ETS** External (inter-abstraction) transformation summaries
### Why
- Needed for DSW.C2, WTB.C2, TVR.C1
- Potentially helps with DSW.N1

### What
  - (beginning with a data abstraction summary of their own, that does *not* include one of our four non-Other dataset types)

## *Future Work:* **ITS** Internal (intra-abstraction) transformation summaries
### Why
- Needed for DSW.C2, WTB.C2, TVR.C1
- Potentially helps with DSW.N1

### What
  - (beginning with a data abstraction summary of their own, that includes at least one of the four non-Other dataset types)

# Metadata that we want to collect during / after each of the above:

## **FTC** Familiar tool classifications
### Why
- Needed for DSW.C1, DSW.C2
- Potentially helps with DSW.N1, DSW.N2

### What
- At the end of each activity, users will Likert-rate a selected sample of software tools that other users have identified, w.r.t:
  - personal familiarity with the tool
  - perceived relevance to the particular data abstraction or transformation
  - usability
  - expressiveness
- Submit names of other tools that they use (or could imagine using) with a particular data abstraction or data transformation

## **CQE** Creative Question Evaluations
### Why
- Needed for DSW.C3
- Potentially helps with VE.N1

### What
- At the end of each activity, users will ... **todo**
- Other ideas: detect when users go back to change answers? Ask users to Likert-rate the extent to which the survey caused them to think about their data differently? How to word "differently"?

## **JTM** Jargon translation maps
### Why
- Needed for DSW.C4, WTB.C3
- Possibly needed for DSW.C1, DSW.C2
- Potentially helps with DSW.N1, DSW.N2, VTD.N1, VDSR.N1, VDSR.N2, VE.N2

### What
- Throughout all activities, CS jargon will be presented, and users will be encouraged (**todo:** how?) to choose more appropriate terms for their domain
- At the end of each of the above activities, a simple matching quiz will be issued (term to definition), randomly selecting from the set of terms the user was exposed to

## **CUE** Conceptual Understanding Evaluations
### Why
- Needed for DSW.C4
- Potentially helps with VE.N2

### What
- At the end of each activity, users will take a short conceptual quiz, matching random subset of terms to the corresponding definition (use the translated version if the user specified one)

# Functionality the system must implement

**TODO**
