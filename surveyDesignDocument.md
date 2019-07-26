# Setup
Terms with an asterisk* will have on-demand interactive definitions

0. Consent process
  - Warning that participants' data will be **publicly available** (link to the database front-end)
  - Answers aren't right or wrong—the data will be used like Yelp reviews to guide researchers as to whether / how a wrangling operation is useful to someone somewhere
  - We have structured the survey to make responses as anonymous as possible, however we cannot prevent re-identification if you volunteer information about yourself in your responses (details such as very unique datasets could be used to identify you)
  - A unique ID will be assigned to this browser to link your responses together; you can break this connection any time by clicking this button for a new ID. Similarly, clearing local browsing data will do the same thing
  - Our contact information if they wish to remove any or all responses in the future
  - *todo:* what's the best way to enable researchers to contact participants about further studies in a secure + private way (would a separate, private google form linking to their ID be sufficient—and researchers would have to go through us to get their contact info)?
1. Option to walk through a pre-filled tutorial (wrangling movies?)
  - Tutorial examples and word definitions will be available on demand in the real survey as well
2. Provide the shortest possible label for a dataset that you are familiar with:
  - Suggestions pre-populated from prior users
  - Have worked with this data before?
  - Do you have this kind of dataset now?
  - Are you planning to collect or obtain this dataset in the future?
3. Select the best fit for this dataset from a set of idealized structure visualizations (based on VAD Ch. 2)
  - Tables*
  - Network* / Tree*
  - Field*
  - Geometry*
  - Clusters* / Sets* / Lists*
  - The dataset a hybrid combination of one of the above (if so, check this box and select the best fit for what you feel is the most important component, or the component that you interact with the most)
  - None of these describes the dataset (please describe why; survey ends)
4. Describe the characteristics of the dataset
  - Tables
    - How many tables (1,2,3+)?
    - Repeat 1 time (or 2 if more than 1 table):
      - Fill in a 2x2 table with example data, with row and column headers
    - Would you expect any of the following to apply to any cells in any table:
      - Categorical* values?
      - Quantitative* values?
      - Ordinal* values (auto-yes if quantitative)?
      - Nested* structures?
        - Ask for 2 example cells
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
5. Is there anything that you feel is interesting about this dataset that the
   above questions don't ask?
6. What analysis questions* do you imagine this dataset could answer?

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
5. Are there any analysis questions* that this dataset could answer, that the original one couldn't?
6. What do you wish was easier about transforming data?
7. Field for adding contact email address to be contacted about future studies

# Repeating (for really engaged users)
1. Allow users to try different transformations with the same original dataset
2. Allow users to go back to the beginning and enter a different dataset
