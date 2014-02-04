**Handlebars Watch Plugin**

This is a tool watch directories of handlebars templates and compile them.

Right now, it fits a very specific use case.

It assumes the structure of

    handlebars/grouping/
      /template1.html
      /template2.html

When running handlebars-watch-mvn inside the handlebars folder, it will generate the output of handlers/grouping/grouping.js at 1) initial run and 2) on any change in the child folder.

This is modeled after a specific output of the handlebars-maven-plugin.
