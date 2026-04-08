<p align="center">
  <img src=".github/ob1-logo-wide.png" alt="Open Brain" width="600">
</p>

<h1 align="center">Open Brain</h1>

The infrastructure layer for your thinking. One database, one AI gateway, one chat channel. Any AI you use can plug in.

This repo mixes the public Open Brain learning path with the maintained product app, reusable dashboards, and supporting implementation docs.

> Open Brain was created by [Nate B. Jones](https://natesnewsletter.substack.com/). Follow the [Substack](https://natesnewsletter.substack.com/) for updates and join the [Discord](https://discord.gg/Cgh9WJEkeG) for real-time help and community.

## Getting Started

Never built an Open Brain? Start here:

1. **[Setup Guide](docs/01-getting-started.md)** - Build the full system in about 45 minutes.
2. **[AI-Assisted Setup](docs/04-ai-assisted-setup.md)** - Pair with Cursor, Claude Code, Codex, or another AI coding tool.
3. **[Companion Prompts](docs/02-companion-prompts.md)** - Use the prompt pack to migrate memories and build the capture habit.
4. **Then pick Extension 1** and start building.

If you hit a wall, use the [FAQ](docs/03-faq.md) and the community AI assistants linked there.

## Repo Map

This repo now has a clear split between product code, reusable templates, and contribution surfaces:

| Path | What lives here | When to change it |
| --- | --- | --- |
| [`apps/brain`](apps/brain/) | Canonical maintained product app | Changes that belong in the unified Open Brain app |
| [`dashboards`](dashboards/) | Reusable frontend templates and dashboard contributions | Changes meant to stay standalone, deployable, or reusable |
| [`extensions`](extensions/) | Curated learning-path builds | Maintainer-approved extension work |
| [`schemas`](schemas/) | Database extensions and table add-ons | New schema modules that layer onto Open Brain |
| [`integrations`](integrations/) | Capture sources, webhook handlers, MCP add-ons | New external connections |
| [`primitives`](primitives/) | Reusable concepts used by multiple builds | Shared concepts that justify extraction |
| [`docs`](docs/) | Setup guides, roadmap, specs, decisions, and build logs | Planning, implementation notes, and contributor guidance |

Moving a feature from `dashboards/` into `apps/brain` is treated as a promotion into product code, not just a folder shuffle.

## Planning Docs

Use these docs consistently so contributors and AI tools do not have to guess where planning artifacts belong:

- [`docs/AI-START-HERE.md`](docs/AI-START-HERE.md) - Fast onboarding for AI coding tools
- [`docs/ROADMAP.md`](docs/ROADMAP.md) - Future priorities and status
- [`docs/specs/`](docs/specs/) - Numbered implementation specs
- [`docs/decisions/`](docs/decisions/) - Durable decision records
- [`docs/builds/`](docs/builds/) - Per-feature implementation logs
- [`docs/drafts/`](docs/drafts/) - Working notes that are not yet committed to the plan
- [`docs/project-index.md`](docs/project-index.md) - Runnable app and dashboard inventory

## Extensions - The Learning Path

Build these in order. Each one teaches new concepts through something you'll actually use.

| # | Extension | What You Build | Difficulty |
| --- | --- | --- | --- |
| 1 | [Household Knowledge Base](extensions/household-knowledge/) | Home facts your agent can recall instantly | Beginner |
| 2 | [Home Maintenance Tracker](extensions/home-maintenance/) | Scheduling and history for home upkeep | Beginner |
| 3 | [Family Calendar](extensions/family-calendar/) | Multi-person schedule coordination | Intermediate |
| 4 | [Meal Planning](extensions/meal-planning/) | Recipes, meal plans, shared grocery lists | Intermediate |
| 5 | [Professional CRM](extensions/professional-crm/) | Contact tracking wired into your thoughts | Intermediate |
| 6 | [Job Hunt Pipeline](extensions/job-hunt/) | Application tracking and interview pipeline | Advanced |

## Primitives

Some concepts show up in multiple extensions. Learn them once, apply them everywhere.

| Primitive | What It Teaches | Used By |
| --- | --- | --- |
| [Row Level Security](primitives/rls/) | PostgreSQL policies for multi-user data isolation | Extensions 4, 5, 6 |
| [Shared MCP Server](primitives/shared-mcp/) | Giving others scoped access to parts of your brain | Extension 4 |

## Community Contributions

Beyond the curated learning path, the community builds and shares:

### [`/recipes`](recipes/)

Step-by-step capability builds such as imports, automations, and one-off utilities.

### [`/schemas`](schemas/)

Database extensions that layer onto your existing Open Brain schema.

### [`/dashboards`](dashboards/)

Standalone frontend templates you can host on Vercel or Netlify. The maintained product app lives in [`apps/brain`](apps/brain/).

### [`/integrations`](integrations/)

MCP extensions, webhook receivers, and capture sources beyond Slack.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the full details. The short version:

- **Extensions** are curated - discuss with maintainers before submitting
- **Primitives** should be referenced by 2+ extensions to justify extraction
- **Recipes, schemas, dashboards, integrations** are open for community contributions
- Every PR runs through an automated review agent before human review
- Each contribution needs a `README.md` and a `metadata.json`

For AI-assisted work, start with [CLAUDE.md](CLAUDE.md) and [docs/AI-START-HERE.md](docs/AI-START-HERE.md).

## Community

- **[Discord](https://discord.gg/Cgh9WJEkeG)** - Real-time help, show-and-tell, contributor discussion
- **[Substack](https://natesnewsletter.substack.com/)** - Updates, deep dives, and the story behind Open Brain

## License

[FSL-1.1-MIT](LICENSE.md)
