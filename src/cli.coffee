require "colors"
{ncp} = require "ncp"
{global} = require "node-prefix"

class CLI
    create: (projectName) ->
        # this must copy the whole build folder
        console.log "...".blue
        console.log "This script will create your "
        console.log "project in just a few (milli)seconds."

        PATH = global("wage") + "/build"

        ncp(PATH, projectName, (err) ->
            if err
                console.log "\n\nSomething went wrong."
                console.error err
                console.log "...".blue
            else
                console.log "Your project is ok, enjoy!"
                console.log "...\n\n".blue
            return
        )

        return "..."

module.exports = wage = new CLI()
