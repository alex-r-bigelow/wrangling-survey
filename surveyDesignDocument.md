# Background
## Broad space of Data Science Worker activities
- Discovery vs Capture vs Curation vs Design vs Creation [Muller et al. 2019]
  - Our target is specifically ***Design***

## Prior efforts to create frameworks to describe designing a data model
- "What: Data Abstractions" [Munzner 2014]
- Databases:
  - Tabular (**todo**)
    - Business Intelligence (ELT vs ETL), data cubes
  - Network (**todo**)
  - Spatial (**todo**)
  - Text (**todo**)
- OOP:
  - "Semantic Data Modeling" [Klas, Shrefl 1995]
- Ontologies (**todo**)

## Data abstractions in practice
- Visualization:
  - In design studies [Nested Model, DSM]
  - Effects on analysis questions that are considered [AVI, BS thesis, **todo**]
- Existing wrangling systems:
  - Tabular [**todo**]
  - Network [**todo**]
  - Spatial [**todo**]
  - Text [**todo**]
- Databases again?

# Persona-Specific Contributions, Other Needs, Risks, Tests, Limitations
The survey we are designing, and the data that we are collecting:
- are intended for a specific, diverse set of goals for two persona types (DSW and WTB)
- may potentially assist with additional goals, belonging to other persona types (VTD, VDSR, VE)

## Core survey personas
The survey we are designing, and the data that we are collecting, are mainly intended for:

- **DSW** Data Science Workers
  - Contributions:
    - **DSW.C1** Need for a tool to suggest or support search / discovery of similar data abstractions and associated:
      - **DSW.C1.1** wrangling tools
      - **DSW.C1.2** visualization software
    - **DSW.C2** Need for a tool to suggest or support search / discovery of similar data transformations and associated visualization techniques
    - **DSW.C3** Need for a creativity exercise that provokes out-of-the-box analysis questions
    - **DSW.C4** Need for opportunities to learn basic CS concepts in the context of familiar data, that can take advantage of other participants' translations
  - Other Needs:
    - **DSW.N1** Need for opportunities to connect with Wrangling Tool Builders, Visualization Technique Developers, or Visualization Design Study Researchers for more in-depth collaborations
    - **DSW.N2** Need for opportunities for voice / perspective / language / specific problems to be heard in a way that (could) impact the design of future tools
  - Risks:
    - DSWs may not find relevant information [DSW.C1, DSW.C2]
      - Test:
    - Our survey may not provoke out-of-the-box analysis questions [DSW.C3]
      - Test: Participants will self-report (Likert), and we will qualitatively evaluate, whether forced transitions provoked novel perspectives on the data
    - Contextual definitions, even with alternate translations, may not be sufficient to teach basic CS concepts [DSW.C4]
      - Test: Short conceptual quiz (matching a random subset of terms to their definition) at the end
  - Limitations:
    - Data Science Workers are extremely diverse (designers, excel users, scientists, etc.); only a subset of Needs may apply
    - Individual Data Science Worker needs are also very diverse (discovery, capture, curation, etc.); our work only begins to focus one narrow aspect (design)
    - DSWs may never hear from anyone [DSW.N1]
    - WTBs may not consult specific user responses [DSW.N2]
  - User costs:
    - Time commitment
    - Privacy (data is public)
    - May have to do the work of translating (potentially unfamiliar) CS jargon to domain concepts

- **WTB** Wrangling Tool Builders
  - Contributions:
    - **WTB.C1** Needs real-world, crisply defined data abstractions so that generalized tools are capable of modeling a diverse array of specific abstractions
    - **WTB.C2** Needs real-world, crisply described examples of data transformations that:
      - **WTB.C1.1** In their basic form, require less than the expressiveness of Turing-complete programming languages
      - **WTB.C1.2** Do not yet have adequate support in existing software (especially w.r.t. interface designs that eliminate/reduce the need for programming)
    - **WTB.C3** Needs ways to translate data abstraction and transformation jargon to:
      - **WTB.C2.1** More easily-understood domain concepts (for applied tools)
      - **WTB.C2.2** More easily-understood general terms for CS jargon (for general tools)
  - Risks:
    - DSWs might only specify highly expressive data transformation requirements [WTB.C2]
      - Test: in addition to allowing for open-ended comments for users to describe needed expressiveness, ask how *likely* (Likert) it is that a visual interface will someday capture enough nuance to correctly perform a specific transformation, without requiring the user to write code
    - Only transformations that have support in existing software are specified [WTB.C3]
      - Test: if the list of user tools is blank that means either that 1) the user is unaware of existing tool support [DSW.C2], or that 2) no support exists. If the list is not blank, the participant's response helps [DSW.G1] more than [WTB.C3]
    - Resulting domain map may be incomplete (if users don't bother to fill in alternates) / biased (if users misunderstand / mistranslate) [DSW.G2]
      - Test: follow-up survey with independent domain experts that we identify, only checking terminology
  - Limitations:
    - Tempting to generalize about which abstractions or transformations are *most* common, but our participant pool will be biased (gets worse when we, ourselves, archive prior design study abstractions)
    - Tempting to generalize about which general terms for CS are *most* common, but our participants will be biased—at most, this survey will help us to identify (probably) "good" terms

- **TVR** Theoretical Visualization Researchers
  - Contributions:
    - **TVR.C1** Need for data that characterizes the design space of non-tabular data abstraction transformations
  - Risks:
    - [DAS] may over-simplify individual abstractions
      - Test:
        - pilot [DAS] by characterizing design studies from VIS that have clearly documented data abstractions
        - post-hoc qualitative evaluation of the degree to which open-ended comment fields indicate failures to capture abstractions
    - The data may not be
  - Limitations:
    - The data may include a representative sample of real-world needs

## Relevant survey personas
Other people could potentially benefit from this work. Although we consider their needs as part of the survey design, we do not specifically test whether those needs are met.

- VTD Visualization Technique Developers
  - Other Needs:
    - **VTD.N1** Seeks real-world, crisply described examples of specific data abstractions that do not yet have adequate visualization support; our work could improve *a little* on current Maslow's hammer practices
  - Limitations:
    - We won't be collecting very detailed task abstraction info; likely won't be *enough* to adequately justify pure technique work as useful in the real world [VTD.N1]

- VDSR Visualization Design Study Researchers
  - Other Needs:
    - **VDSR.N1** Seeks jump-started collaborations with Data Science Workers:
      - **VDSR.N1.1** Do they have interesting data problems?
      - **VDSR.N1.2** How to be advised in advance of common winnowing problems?
      - **VDSR.N1.3** How to translate between domain concepts and CS jargon?
    - **VDSR.N2** Seeks evidence that a given data abstraction effectively represents a Data Science Worker's mental model
  - Limitations:
    - Impossible to fully *validate* a data abstraction based on this data [VDSR.N2]

- VE Visualization Educators
  - Other Needs:
    - **VE.G1** Seeks ways to encourage students to explore more varied visualization designs
    - **VE.G2** Needs ways to teach data abstraction concepts to students with non-CS backgrounds
  - Limitations:
    -

# Data That We Will Collect
Explicit surveys a user can take:
- **DAS** Data abstraction summaries
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
- **ETS** External (inter-abstraction) transformation summaries
  - (beginning with a data abstraction summary of their own, that does *not* include one of our four non-Other dataset types)
- **ITS** Internal (intra-abstraction) transformation summaries
  - (beginning with a data abstraction summary of their own, that includes at least one of the four non-Other dataset types)

Meta-surveys that will take place during / after each of the above:
- **FTC** Familiar tool classifications
  - At the end of each activity, users will Likert-rate a randomly selected sample of relevant software tools that other users have identified, w.r.t:
    - familiarity
    - usability
    - expressiveness
  - Submit names of other tools that they use (or could imagine using) with a particular data abstraction or data transformation
- **CQE** Creative Question Evaluations
  - At the end of each activity, users will **todo**
- **JTM** Jargon translation maps
  - Throughout all activities, CS jargon will be presented, and users will be encouraged (**todo:** how?) to choose more appropriate terms for their domain
  - At the end of each of the above activities, a simple matching quiz will be issued (term to definition), randomly selecting from the set of terms the user was exposed to



============================= Island of lost text ==============================



## Paper reviewer personas
**todo:**
- Need to sweeten the pot for these people (try to identify more of their potential Goals, without getting too distracted from our Core personas)
- My perspective is very clearly Visualization-focused; need to cast a wider net

Ideally, we'd like to get people from the Core or Relevant persona categories to review the paper, but we're also in danger of getting the following (don't need to code these, but they will be important to discuss these in the paper text):

- Visualization Research Generalists
  - Goals:
    - Seeks an understanding of where / how theoretical CS concepts are (or could be) useful in the real world
    - Seeks to taxonomize existing data abstractions
  - Risks / Limitations:
    - *Very* likely to misunderstand the scope
      - We are *not* attempting a Data Abstraction Taxonomy, but our data could inform one
      - We'll attempt a really in-depth background / lit review (see above)
      - **todo: very likely there are more that I'm blind to...**
    - Lots of competing / semi-overlapping frameworks
      - Our methodology will seem arbitrary / simplistic / weak
        - We want to limit the amount of jargon an Analyst has to translate
        - We want to avoid n^2 combinatoric problems w.r.t. general data transformations
        - At least grounded in Munzner 2014, but with two adaptations
      - Lots of competing / semi-overlapping jargon
        - Our attempt to translate terms should help the data be somewhat framework-agnostic
        - Very unlikely that any specific term will satisfy everyone
    - Our data collection methodology is neither fish nor fowl
      - We include warnings in our visualizations for how *not* to use the data (see per-persona Risks)
      - Many uses:
        - Survey reuse
          - As a creativity exercise [DAF]
          - Reuse for a target population to investigate stronger hypotheses about usefulness (wrangling tools or prevalence of abstractions)
        - Direct data uses
          - Connecting Data Science Workers with Wrangling Tool Builders, Visualization Technique Developers, Visualization Design Study Researchers
          - Exemplars to *help* (but not fully) justify:
            - Usefulness of wrangling tools
            - Usefulness of visualization techniques
            - Validity of data abstractions in a design study
        - Qualitative aggregate data uses
          - Grounded theories about data abstractions within or across domains
        - Quantitative aggregate data uses
          -

- Theoretical Computer Scientists
  - Goals:
    -
  - Risks / Limitations:
    -

- Database Researchers
  - Goals:
    -
  - Risks / Limitations:
    -

- Database Practitioners
  - Goals:
    -
  - Risks / Limitations:
    -







Terms with an asterisk* will have on-demand interactive definitions, examples
0. Consent process
  - Warning that participants' data will be **publicly available**
  - We have structured the survey to make responses as anonymous as possible, however we cannot prevent re-identification if you volunteer information about yourself in your responses (details such as very unique dataset labels or details could be used to identify you)
  - A unique ID will be assigned to this browser to link your responses together. While you can break this connection any time by clearing local browsing data, this is *not* advised for privacy, as we will no longer have a way to identify which responses are yours in order to modify or delete them.
  - If
  - If participants are open to contact about further studies, they can enter an email address; this will be stored in a separate, private form, and no other researchers will be allowed to see it. Instead, interested researchers will contact us directly, and we will forward their information to the participant.
    -
  - Our contact information if they wish to remove any or all responses in the future
  - *todo:* what's the best way to enable researchers to contact participants about further studies in a secure + private way (would a separate, private google form linking to their ID be sufficient—and researchers would have to go through us to get their contact info)?
1. Introduction
  - Answers aren't right or wrong—the data will be used like Yelp reviews to guide researchers as to whether / how a wrangling operation is useful to someone somewhere
  - Editing terminology
1. Domain Characterization
  - We want to be as open-ended as possible for types of datasets considered—from real ones people are working with right now to hypothetical ones that they can dream up
  - Generic, short label (e.g. "Brain fMRI") should provide enough context without compromising anonymity
  - Where real domain experts are filling in the form (e.g. there is potential for a design study)
  - Need a special mode here to indicate that an author is summarizing an existing design study data abstraction
1. **Dataset label** Please give a short name of **any** dataset that you're familiar with, or, if you prefer, feel free to choose one of the datasets that other participants have used—even if you're not familiar with it.
  - Suggestions pre-populated from prior users
  - Have worked with this data before?
  - Do you have this kind of dataset now?
  - Are you planning to collect or obtain this dataset in the future?
2. Select the best fit for this dataset from a set of idealized structure visualizations (based on VAD Ch. 2)
  - Tables*
  - Network* / Tree*
  - Field*
  - Geometry*
  - Clusters* / Sets* / Lists*
  - **Is hybrid** The dataset a hybrid combination of one of the above (if so, check this box and select the best fit for what you feel is the most important component, or the component that you interact with the most)
  - **Different type** None of these describes the dataset (please describe why; survey ends)
3. Describe the characteristics of the dataset
  - Tables
    - How many tables (1,2,3+)?
    - Repeat 1 time (or 2 if more than 1 table):
      - Fill in a 2x2 table with example data, with row and column headers
    - Would you expect any of the following to apply to any cells in any table:
      - Categorical* values?
      - Quantitative* values?
      - Ordinal* values (auto-yes if quantitative)?
      - Multidimensional cells*?
      - Nested cell structures*?
        - Ask for 2 example cells
      - Foreign keys*?
      - Implicit table relationships*?
      - *todo:* how to ask about multidimensional tables in a way that doesn't create confuse with nested structures?
      - Empty cells?
  - Network / Tree
    - How many node classes* (1,2,3+)?
    - How many link classes* (1,2,3+)?
    - Have the user create and label at least a 4-node, 3-link network...
      - With at least 2 node/link classes represented if either/both have more than 1
      - Toggles on links for direction
    - What is the greatest number of attributes* that nodes have (1,2,3+)?
    - What is the greatest number of attributes* that links have (1,2,3+)?
    - Would you expect any of the following to describe the network?
      - Network is undirected*, directed*, or mixed*
      - Network is a Tree*
      - Network is connected* (auto-yes if tree)
      - Network contains cycles* (auto-no if tree)
      - Network contains parallel links*
      - Network contains self-links*
      - Network contains supernodes*
      - Network contains hyperedges*
  - Field
    - How many dimensions* does the underlying grid* have (1,2,3+)?
    - How many attributes* does each position* in the grid have (1,2,3+)?
    - Fill in at a square (1x3 if one-dimensional) of example values, with at most 2 attributes per point
    - Would you expect any of the following to describe the field?
      - Points are scalars*, vectors*, or tensors*
      - Continuous* vs Discrete*
      - *todo*
  - Geometry
    - *todo*
  - Clusters, Sets, Lists
    - *todo*

# Forced transformation
One of these scenarios will be randomly selected by the survey (in the event that the participant is repeating the survey, the same transformation will not be repeated):
1. The system forces an intra-abstraction change
  - Tables
    - Items to Attributes, Attributes to Items
    - If nested attributes were present, convert them to rows or columns
    - *todo*
  - Networks & Trees
    - Nodes to Links, Links to Nodes
2. The system forces an inter-abstraction change
  - Tables to Network / Tree
  - Network / Tree to Tables
  - Tables to Field
  - Field to Tables
  - *todo* etc.

After the transformation is introduced:
- Imagine what this new structure **could** be like (even if it doesn't make much sense)
  - A "sorry this doesn't make **any** sense" escape option (please describe why; survey ends)
- repeat the "Describe the characteristics of the dataset" step

# End debriefing
1. In your opinion, how useful would this transformation be? (likert)
2. Checkboxes:
   A) This transformation would be likely to require additional data collection
   B) This transformation would be likely to lose data
3. With the software tools* that you are already comfortable using, how easy / hard would it be for you to perform this transformation? (likert)
4. Which software tools*, if any, would be most useful to perform this transformation (comma separated list)?
5. Are there any analysis questions* that you feel either
6. What do you wish was easier about transforming data?

# Repeating (for really engaged users)
1. Allow users to try different transformations with the same original dataset
2. Allow users to go back to the beginning and enter a different dataset
