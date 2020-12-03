# corgit

## Prerequisits

Create a file in `~/.corgit/config.json` with the following content:

```json
{
  "github": {
    "pat": "9b9c9....54234cf"
  }
}
```
The pat is your github personnal access token.
It is required to generate the changelog using github linked issue's title.


## Usage

Install with `npm i -g corgit` or `yarn global add corgit`

```
cg [command]
```

### cg `bump` generates a changelog & bump the version

Corgit bump goes through your commit history from the latest known version (that is on your package.json file),  
looks up the kind of commit this is (feature / chore / fix / ...) and bumps the version accordingly (breaking => major, feature => minor, the rest => patch).

Corgit bump also generates a changelog like so:

```md
# Version [major]

## v[major].[minor]

### [major].[minor].[patch]         //- The most recent is on top

#### Significant changes

- **[feat]**
  - [issue title] #[issue id]
  ...

#### Commits

- [link to commit]: message (@author)
```

Note:
- Significant changes are classed as follow: `feat` > `fix` > `refac` > `test` > `style` > `chore` > `doc` > `misc` (the latest being used when we failed to identify the commit kinds)
- Significant changes are based on the commit you made, in criticity order. That is, if you made a `feat` commit then a `style` one, the issue title will be in the `feat` section
- Significant changes takes the title of the github issue, so make sure that your commit is in a pull request and that the pull request has a linked issue :)
