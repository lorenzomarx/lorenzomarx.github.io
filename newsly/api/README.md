# Newsly API Scripts

Per-source Python scripts that hit [newsapi.org](https://newsapi.org) and write a JSON snapshot into each source folder. Each source page on the site reads that JSON to render its articles.

## Setup (Raspberry Pi / cron host)

1. **Get a newsapi.org API key.** Sign up at https://newsapi.org/register.

2. **Set the key as an environment variable** so the scripts can read it without it being committed to the repo:

    ```bash
    # In ~/.bashrc, ~/.profile, or your cron environment file:
    export NEWSAPI_KEY="your-key-here"
    ```

    For a cron job, set it in `/etc/cron.d/newsly` or inline:

    ```cron
    NEWSAPI_KEY=your-key-here
    */15 * * * * pi cd /path/to/newsly/api/bbcApi && /usr/bin/python3 bbc.py
    ```

3. **Install Python dependencies:**

    ```bash
    pip3 install requests
    ```

4. **Test one script manually first:**

    ```bash
    cd newsly/api/bbcApi
    NEWSAPI_KEY=your-key-here python3 bbc.py
    cat bbc.json
    ```

## Sources

| Folder         | Source ID (newsapi.org)   | Endpoint           | Output JSON              |
| -------------- | ------------------------- | ------------------ | ------------------------ |
| `aljazApi`     | `al-jazeera-english`      | `top-headlines`    | `aljaz.json`             |
| `ap`           | `associated-press`        | `top-headlines`    | `ap.json`                |
| `bbcApi`       | `bbc-news`                | `top-headlines`    | `bbc.json`               |
| `bbcSport`     | `bbc-sport`               | `top-headlines`    | `bbcsport.json`          |
| `bloomberg`    | `bloomberg`               | `top-headlines`    | `bloomberg.json`         |
| `breaking_us`  | (country=us)              | `top-headlines`    | `breaking_us.json`       |
| `cnn`          | `cnn`                     | `top-headlines`    | `cnn.json`               |
| `huffington`   | `the-huffington-post`     | `top-headlines`    | `huff.json`              |
| `techradar`    | `techradar`               | `top-headlines`    | `techradar.json`         |
| `vice`         | `vice-news`               | `everything`†      | `vice.json`              |
| `washpost`     | `the-washington-post`     | `top-headlines`    | `washpost.json`          |
| `wired`        | `wired`                   | `top-headlines`    | `wired.json`             |
| `wsj`          | `the-wall-street-journal` | `top-headlines`    | `wsj.json`               |

† `vice-news` is frozen on `/v2/top-headlines` (returns 2020 articles). The script uses `/v2/everything?sources=vice-news&sortBy=publishedAt` instead, which is still fresh.

Most scripts use the `/v2/top-headlines` endpoint. (Note: `/v1/` is deprecated and returns frozen data — do not switch back to it.) See `SOURCES.md` for the full catalog of available newsapi sources by country and category.

## Security note

API keys must never be committed to this repo. Use the `NEWSAPI_KEY` environment variable. If a key leaks into git history, rotate it via the newsapi.org dashboard.
