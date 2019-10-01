Contributions of the pilot paper
================================

# Dataset that characterizes the design space of abstractions and transformations
Includes a simplified taxonomy that characterizes the design space of data abstractions

## Addresses needs
- PN.WTB.1
- PN.WTB.2
- PN.TVR.1
- PN.TVR.3

## Evaluations, Models, Corpus
- **C** PN.TVR.3, PN.WTB.1
  - A corpus of survey responses, in which real-world practitioners self-report the extent to which discrepancies between the structure of their raw data and their semantic mental models exist; and the extent to which such discrepancies are perceived to be problematic
  -
- **E1** PN.WTB.1
  - Qualitatively evaluate the extent to which the simplified taxonomy is compatible with existing design studies; pay close attention to design studies that don't have enough information, or those that break the taxonomy
- **E2** PN.WTB.1
  - Qualitatively evaluate the extent to which existing general-purpose systems support / do not support each DR.DAS [Tableau, Gephi, LineUp, UpSet, Jigsaw, etc] / DR.ETS [Trifacta, Ploceus, Orion, Origraph, Google Refine, etc] entry
  - Note: This feels like DR.FTC, but the problem is that most users are *maybe* familiar with just one or two of the systems that we're evaluating... so we need to do the evaluation based on their descriptions, and DR.FTC is best left as future work
- **E3** PN.WTB.2
  - Describe hypothetical tools (like the Bridge Model paper), based on individual DR.ETS responses, that meet the WTB.2.1, WTB.2.2 criteria
- **M** PN.TVR.1
  - Model based on observed DR.ETS responses
  - Goal is to model *transitions*, from one data abstraction to another

  - Is our simplified taxonomy broad enough to avoid many N/A responses? If so, can a simple graph model the design space of transformations?
  - Is a simple graph sufficient, or is a (directed) hypergraph needed?

Paper outline
=============

# Introduction

# Background
