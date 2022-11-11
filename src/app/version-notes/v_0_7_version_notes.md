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
  - initial attempt to more effortly address out of space errors
  - fragile RBSS from fixed parent location
  - try to in best effort manner preserve user bubble orientation when re-allocing for more reasonable space usage
  - live pulling from github, and init mindmap from specific md files?

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

[v] 3.4.8 reference bundle block info into Mm-isque objects

[v] 3.4.9 testing
  - feather out the canvas scope testing framework
    - mostly just using testpoints col for visualization
    - using techniques thru exploratory learning
      - invariants, assertions, expectation calibration

[v] 3.4.10 restoring program internal coherence
  - for canvas related data types
    - review obj functions, update or trim as necessary
    - check how reference storing is handled across the framework
  - reflect data-typing changes to related components to restore program internal coherence

[v] 3.5 ownership based free that includes associated links

[v] 3.6 recursive child relocate needs to be perform in an atomic manner
      - else not enough context to know if child's child will be deadlocked out of space

[v] 3.7 prepping for backend integration 1
  [v] review and clean up src code after 3.4.7
  [v] implement better generateExample()
  [v] blow out disp to take up available room more aggressively
    - parameters still need tuning, and the full imp of RBSS awaits as well
  [v] resolve the equal level cmd bug in build execution tree()

[v] 3.8 prep 2
  [v] review other aspects of mm canvas generative basis
  [v] review logic used in response functions
  [v] implement rest of response functions
  - fail space allocation more gracefully
    - establish 3 ways to edit highlight color of an entity in space (e node || link)
      [v] reference thru highlight command (node: absolute, link: relative)
        [v] imp highlight cmd as such
      [v] error generation
        [v] error generation should restore to prev stable state as part of last resort resolution
      - user direct intervention (on click events)
        - z index overlay cover touching area issue resolve
  [v] resolved bug around maintaining cluster size invar
  [v] resolved bug around unlink unconditionally touching activeLink collection
  [v] adjusted search limits to give more effort to searches

[v] 3.9 prep 3
  [v] user direct intervention test imp (mouse events)
    [v] z index overlay cover touching area issue resolve
    [v] user relocate
      [v] mousedown -> grab
        - store init location data
      [v] mousemove -> trace
        - liberate svg element from grid confines
      [v] mouseup -> drop
        - check if location can host node
          - if so, relocate and adjust links
          - else, return to stored prev stable state
  [v] RBSS rework
    [v] rework RBSS with more reasonable state transition in between migrate attempts
      - now free child node and parent link b4 migrate attempts
        [v] more room for migrate this way  
          - if migratable -> next stable state alloc
          - else no alloc changes made to child or parent link
    [v] rework RBSS error handling: presentation
      [v] no longer removes link, instead now:
        [v] keep problem child/link off the grid
        [v] restore child original location
        [v] change link for parent side
        [v] highlights link and problem c->p pair with error color
          - parent has darker red
        [v] recursively mark all des of child for correction
  
3.10 prep 4
  [v] error handling continued: resolution
      [v] user intervention mechanism implement
        [v] grab, trace, drop implementation review
        [v] parent links shoud not be any diff from child links
        [v] red light needs to stay on til link is situated
  - imp loose link tracing to get around the port crowdedness issue
  - refactor mm-canvas code
  - normalizing display window and cell related dimension settings
    - window resizing adapt
  - display touchup
    - presentation should provide info about problem childs
      - show grid on error handle workflow init?
    - review error resolution workflow
      - show grid button
      - tl err flag just for visuals?
  [v] direct user intervention export interfaces prepare
  [v] reflect on bugs
    - generateExample repeated call induced error incomplete handling error
    - a lot of space alloc error are actually cuz the atomic blocks are too big, for the smallish bubbles, exit ports get crowded quickly and raise flags

continue to [7]

------------------------------------------------------------------------------------------------------
post processing & misc items:

[v] 4. update reasonable space alloc framework with links on radar, the radial search should
    check for link space availability as well to determine if a point in scope can host a child node specifically
      - iterative deepening with lim >= 1, update out old position as lim structure

[v] 5. link command should handle the case that a child is taken from its parent and respond in a 
    reasonable manner

[v] 6. start working on the generative order update, clean up the src code and review the current framework

7. how should mindmaps be represented in persistent storage?
  - initial experience with from persistent storage context switch implementation

*******************this concludes Path Notes v0.7 functional mindmap module

extras
  - getting canvas onChange to proc even with repeated user input
  - consider how 3+ bullet points in this doc can be incorporated into the GO update
  - bubble dims !== border box dims, check for a,b usage when entityWidth/Height should be used
  - lots of 'diff-by-1' kind of directional differences, recheck later checklinkspace stuff
  - review src code fx ordering for 3.4.2 & +
  - document assertions like connectedness of commands e user input as premise of fx like buildextree etc etc
  - mm controls -> using chaining events to address the repeated user input stuff
  - mm controls -> the on user input detection logic should be ironed out more
  - initial attempt to more effortly address out of space errors
  - fragile RBSS from fixed parent location
  - try to in best effort manner preserve user bubble orientation when re-allocing for more reasonable space usage
  - live pulling from github, and init mindmap from specific md files?
  - lvl 3 response function -> merge implement
  - rework RBSS to remove boolean return, eaiser to ask for user correction than otherwise
  - refactor mindmap module components
    - remove mindmap wrapper