# Contributing to Energy Management System

Thank you for your interest in contributing to this Energy Management System project!

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. Check if the issue already exists in [Issues](https://github.com/inadeafrica/EMS/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - System information (OS, Docker version, etc.)
   - Relevant logs

### Submitting Changes

1. **Fork the repository**

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Update documentation if needed
   - Test your changes

4. **Commit your changes**
   ```bash
   git commit -m "Add feature: description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Ensure CI checks pass

## Development Setup

### Prerequisites

- Docker and Docker Compose
- Git
- Text editor or IDE

### Local Development

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/EMS.git
   cd EMS
   ```

2. Set up the environment:
   ```bash
   make setup
   ```

3. Start the system:
   ```bash
   make start
   ```

4. Make changes and test:
   ```bash
   make restart
   make logs
   ```

## Types of Contributions

### Documentation

- Improve README or guides
- Add examples
- Fix typos or clarify instructions
- Translate documentation

### Configuration

- Add configuration examples
- Create templates for specific use cases
- Improve default settings

### Docker Setup

- Optimize Docker Compose configuration
- Add health checks
- Improve networking
- Add monitoring

### Integration

- Add integration with other systems
- Create plugins or extensions
- Add support for new devices

### Testing

- Add test scripts
- Create validation tools
- Improve CI/CD

## Code Style

### Docker Compose

- Use 2-space indentation
- Add comments for complex configurations
- Group related services
- Use meaningful service names

### Configuration Files

- Use JSON for OpenEMS configs
- Add comments (where supported)
- Follow OpenEMS conventions
- Validate syntax

### Documentation

- Use Markdown
- Keep lines under 100 characters
- Use code blocks for commands
- Add examples where helpful

## Testing

Before submitting:

1. Test the basic setup:
   ```bash
   make clean
   make setup
   make start
   make test
   ```

2. Verify services are running:
   ```bash
   make status
   ```

3. Check logs for errors:
   ```bash
   make logs
   ```

4. Test the UI:
   - Access http://localhost:8080
   - Verify dashboard loads
   - Check for console errors

## Pull Request Guidelines

### Title

Use conventional commits format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `chore:` for maintenance
- `refactor:` for code refactoring

Examples:
- `feat: add configuration for solar panels`
- `fix: correct InfluxDB connection settings`
- `docs: update installation guide`

### Description

Include:
- What changed and why
- How to test the changes
- Any breaking changes
- Related issues

### Checklist

- [ ] Changes are tested
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No unnecessary files included

## OpenEMS Contributions

For contributions specific to OpenEMS (not the Docker setup):

- Visit [OpenEMS GitHub](https://github.com/OpenEMS/openems)
- Check [OpenEMS Contributing Guide](https://github.com/OpenEMS/openems/blob/develop/CONTRIBUTING.md)
- Join [OpenEMS Community](https://community.openems.io/)

## Questions?

- Open a [Discussion](https://github.com/inadeafrica/EMS/discussions)
- Ask in [OpenEMS Community Forum](https://community.openems.io/)
- Contact maintainers via issues

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Recognition

Contributors will be acknowledged in the project documentation.

Thank you for contributing! 🎉
