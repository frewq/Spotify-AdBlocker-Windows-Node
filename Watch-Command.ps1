[CmdletBinding(DefaultParameterSetName = "Forever")]
param(
    ## The script block to invoke while monitoring
    [Parameter(Mandatory = $true, Position = 0)]
    [ScriptBlock] $ScriptBlock,

    ## The delay, in seconds, between monitoring attempts
    [Parameter()]
    [Double] $DelaySeconds = 1,

    ## Specifies that the alert sound should not be played
    [Parameter()]
    [Switch] $Quiet,

    ## Monitoring continues only while the output of the
    ## command remains the same.
    [Parameter(ParameterSetName = "UntilChanged", Mandatory = $false)]
    [Switch] $UntilChanged,

    ## The regular expression to search for. Monitoring continues
    ## until this expression is found.
    [Parameter(ParameterSetName = "Until", Mandatory = $false)]
    [String] $Until,

    ## The regular expression to search for. Monitoring continues
    ## until this expression is not found.
    [Parameter(ParameterSetName = "While", Mandatory = $false)]
    [String] $While
)

Set-StrictMode -Version 3

$initialOutput = ""

## Start a continuous loop
while($true)
{
    ## Run the provided script block
    $r = & $ScriptBlock

    ## Clear the screen and display the results
    Clear-Host
    $ScriptBlock.ToString().Trim()
    ""
    $textOutput = $r | Out-String
    $textOutput

    ## Remember the initial output, if we haven't
    ## stored it yet
    if(-not $initialOutput)
    {
        $initialOutput = $textOutput
    }

    ## If we are just looking for any change,
    ## see if the text has changed.
    if($UntilChanged)
    {
        if($initialOutput -ne $textOutput)
        {
            break
        }
    }

    ## If we need to ensure some text is found,
    ## break if we didn't find it.
    if($While)
    {
        if($textOutput -notmatch $While)
        {
            break
        }
    }

    ## If we need to wait for some text to be found,
    ## break if we find it.
    if($Until)
    {
        if($textOutput -match $Until)
        {
            break
        }
    }

    ## Delay
    Start-Sleep -Seconds $DelaySeconds
}

## Notify the user
if(-not $Quiet)
{
    [Console]::Beep(1000, 1000)
}