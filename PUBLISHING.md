# Publishing Guide

## Prerequisites

1. **npm account**: Make sure you have an npm account

   ```bash
   npm login
   ```

2. **Update repository URLs**: Update the repository, bugs, and homepage URLs in `package.json` with your actual GitHub repository

3. **Add author**: Add your name/email in the `author` field of `package.json`

4. **Check package name**: The package name is `camunda-nestjs`. If it's already taken on npm, you'll need to choose a different name or use a scoped package like `@your-username/camunda-nestjs`

## Build the Library

Build the library before publishing:

```bash
npm run build
```

This will compile TypeScript files from `lib/camunda/` to `dist/lib/camunda/`.

## Publishing Steps

### 1. Check what will be published

```bash
npm pack --dry-run
```

This shows what files will be included in the package.

### 2. Test the build locally

You can test the package locally before publishing:

```bash
npm pack
# This creates a .tgz file
# Install it in another project to test:
# npm install /path/to/camunda-nestjs-0.1.0.tgz
```

### 3. Publish to npm

For the first time:

```bash
npm publish
```

For subsequent versions:

```bash
# Update version in package.json or use:
npm version patch  # for 0.1.0 -> 0.1.1
npm version minor  # for 0.1.0 -> 0.2.0
npm version major  # for 0.1.0 -> 1.0.0

# Then publish:
npm publish
```

## Version Management

- **patch** (0.1.0 → 0.1.1): Bug fixes
- **minor** (0.1.0 → 0.2.0): New features, backward compatible
- **major** (0.1.0 → 1.0.0): Breaking changes

## What Gets Published

The following files/directories are included (defined in `package.json` `files` field):

- `dist/lib/camunda/` - Compiled library code (TypeScript declarations, JavaScript, and source maps)
- `README.md` - Documentation
- `LICENSE` - License file

Everything else is excluded via `.npmignore`. The `dist/` directory is not ignored - only the specific `dist/lib/camunda/` path is included via the `files` field in `package.json`.

## After Publishing

1. Create a GitHub release with the same version tag
2. Update documentation if needed
3. Announce the release (if applicable)

## Troubleshooting

### "Package name already exists"

- Choose a different name or use a scoped package (@username/package-name)
- The package name is `camunda-nestjs` - if it's taken, consider a scoped name like `@your-username/camunda-nestjs`

### "You must verify your email"

- Check your npm account email and verify it

### "Insufficient permissions"

- Make sure you're logged in with the correct account
- For scoped packages, ensure you have access to the organization
