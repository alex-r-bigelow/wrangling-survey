# Background
## Broad space of Data Science Worker activities
- Discovery vs Capture vs Curation vs Design vs Creation [Muller et al. 2019]
  - Our target is specifically ***Design***

### Evidence for Data Science Worker abstraction design needs
- (see personaNeeds.md)

## Prior efforts to create frameworks to describe designing a data model
- "What: Data Abstractions" [Munzner 2014]
  - Missing some critical pieces:
    - Textual data
    - Image data
  - Separating geometry / fields creates some weird artifacts
- Rethinking Visualization: A High-Level Taxonomy
  - Continuous vs descrete; like Chi, Riedl and Grammar of Graphics, all about characterizing algorithms-behind-the-vis, not operations as being necessarily useful to the end users
- "An operator interaction framework for visualization systems" [Chi, Riedl 1998]
  - More about the low-level wrangling ops that happen inside a visualization system, to put the visuals in the right place; makes an interesting claim: "this framework provides a clean and concise model for end–users to understand how to operate a system such as the visualization spreadsheet, and to predict the results of applying operators."
  ... in other words, if users understand all the wrangling that a system is doing BEHIND THE SCENES, they'll be able to use apps better! Does that feel backwards to anyone worried about usability? Maybe vis tools need to be more transparent about their models / transformations, somehow?
- Grammar of graphics [Wilkinson, Willis 2005]
  - Similar level as Chi, Riedl 98
- "The Eyes Have It: A Task by Data Type Taxonomy for Information Visualizations" [Shneiderman 1996]
  - The right level of semantic wrangling operations (i.e., in the user's mental model) in the context of USING a vis system; doesn't get into really changing the underlying abstraction / wrangling
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


CHI: Evan peck, rural pennsylvania talking about infographics
