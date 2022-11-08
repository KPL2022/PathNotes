current version: 0.7 functional mindmap module
------------------------------------------------------------------------------------------------------
pre generative order update items:

[v]1. update MmNode's getPortLocation method for straightline links
  - mathematically derive port location thru intersection computation
  - move getPortLocation() out of object, as standalone in canvas comp for now

[v]2. do other stuff to change link to straightlines connecting node center-to-center
  - curves, complexity unjustified, tracing curves for space alloc is a nightmare
  - forgot what i meant by other stuff, so mark as complete i guess =p

[v]3. once links straight line, update link tracing methods, i think allocLink() mostly?
  - put link space usage on the radar

------------------------------------------------------------------------------------------------------
3.4 generative order update:

<!-- 3.4 generative order update, clean up the src code -->
  - start with drawing out the structure mm

3.4.extras
  - getting canvas onChange to proc even with repeated user input
  - consider how 3+ bullet points in this doc can be incorporated into the GO update
  - bubble dims !== border box dims, check for a,b usage when entityWidth/Height should be used
  - lots of 'diff-by-1' kind of directional differences, recheck later checklinkspace stuff
  - review src code fx ordering for 3.4.2 & +
  - document assertions like connectedness of commands e user input as premise of fx like buildextree etc etc
  - mm controls -> using chaining events to address the repeated user input stuff
  - mm controls -> the on user input detection logic should be ironed out more

[v] 3.4.1 mm-service 
  [v] clean up src code -> update and trim comments
  [v] review src code fx ordering
  [v] rework buildExecutionTree() logic
    - for loop -> while
    - reconsider how assertions around cmd name and cmd lvls are done -> really necessary to call helper methods? what about HT?
    - update logic to more reasonably respond to user expression with nested commands
      - prioritize execution order based on cmd lvl, not left->right flat ordering
    
    [v] imp lvl 1 cmd 'edit' & unit test
    [v] update buildExecutionTree() logic to handle building generally
    [v] use edit to form testing basis for correctness of execution tree production & ordering in mm-service
    [v] make generate inference work with stuff like edit 
  
  [v] review buildExecutionTree and resolve smaller issues, including what is above
    - getting rid of surplus helper function calls thru pristine def of info as enums
    - delay dec of vars until needed

[v] 3.4.2 data-typing
  [v] review data-typing decisions to better support canvas functions
    [v] clean up src code, update and trim comments
    [v] compartmentalize data-typing file into directory format
      [v] split into smaller files, each file for typing of a specific purpose

[v] 3.4.3 mm-canvas interpretation response functions
  [v] clean up src code, update or trim comments as necessary
    [v] trim dated comments
  [v] update to restore coherence with the execution tree framework 
  [v] setup function frames

[v] 3.4.4 prep for mm canvas generative basis creation
  [v] reorder basis functions after response function frame
  [v] review contents of basis functions

3.4.5 write recursive generate link function
  [v] split alloc space into variants depending on use case
  [v] incorporate block reference bundling into createOrphan invocation chain
  [v] radial block space search (RBSS) algorithm review
  [v] incorporate block reference bundling and node creation into RBSS
  [v] based on RBSS, write recursive block/link pair space allocation alogrithm
    * this will later serve as generate link function

[v] 3.4.6 stablize RBSS performance
  [v] what to do with cycles? haven't thought about it much yet, but this is a generic graph, at least, the conception so far is that it is
    [v] by single path assertion, can restrict mindmaps to be trees, but is it the reasonable decision?
  [v] generate example restrict to trees only (no cycles)
  
[v] 3.4.7 better link tracing method
  [v] link tracing now uses scaled dy/dx comparison for better pixel -> block mapping
  [v] but the way blocks are mapped, allows for "x" shaped cross links unintended

3.4.8 various
  - blow out disp to take up available room more aggressively
  - initial attempt to more effortly address out of space errors
  - fragile RBSS from fixed parent location

3.4.8 reference bundle block info into Mm-isque objects

3.4.9 review other aspects of mm canvas generative basis

3.4.10 testing
  - feather out the canvas scope testing framework

3.4.11 restoring program internal coherence
  - for canvas related data types
    - review obj functions, update or trim as necessary
    - check how reference storing is handled across the framework
  - reflect data-typing changes to related components to restore program internal coherence

3.4.12 review logic used in response functions

3.4.13 normalizing display window and cell related dimension settings


------------------------------------------------------------------------------------------------------
post processing & misc items:

3.4.a try to in best effort manner preserve user bubble orientation when re-allocing for more reasonable space usage

3.5. ownership based free that includes associated links

3.6. recursive child relocate needs to be perform in an atomic manner
      - else not enough context to know if child's child will be deadlocked out of space

4. update reasonable space alloc framework with links on radar, the radial search should
    check for link space availability as well to determine if a point in scope can host a child node specifically
      - iterative deepening with lim >= 1, update out old position as lim structure

5. link command should handle the case that a child is taken from its parent and respond in a 
    reasonable manner

6. start working on the generative order update, clean up the src code and review the current framework

7. how should mindmaps be represented in persistent storage?

8. how to save/load mindmap module context from persistent storage?

9. implement backend services, most relevantly, for the mindmap and todo list modules

10. todo list commit feature, recurring daily compartmentalization tasks

