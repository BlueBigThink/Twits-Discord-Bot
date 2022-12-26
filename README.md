# twits
Bot that relays messages from discord to Twitter and Stocktwits, from specified channels and users. 
- Cashtags tickers by detecting words in all caps and cross-checking against list of stocks, futures, & crypto tickers. 
- Uses any number amount of hashtags randomly picked from a list. Hashtags categories are set for stocks, futures, & crypto.
- Users with twitter/stocktwits usernames assigned to their Discord ID are @mentioned in posts
- Creates image replicating Discord message, uploaded with every post.
- When image is posted with Discord message it uses that image rather than generating image.

---
run ```yarn deploy-commands``` to deploy the commands

---
Uses slash commands, self-explanatory.

```/manage-channels-add [channel] [category] [delay] [# of hashtags]``` - Adds channel to whitelist

```/manage-user-add [@user] [twitter username] [stocktwits username]``` - Adds user to whitelist

```/manage-channels-remove [channe]``` - Removes channel from whitelist

```/manage-user-remove [@user]``` - Removes user from whitelist

```/manage-channels-list``` - Shows list of whitelisted channels

```/manage-users-list``` - Shows list of whitelisted users
