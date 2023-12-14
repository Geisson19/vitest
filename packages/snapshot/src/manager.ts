import { basename, dirname, isAbsolute, join, resolve } from 'pathe'
import type { SnapshotResult, SnapshotStateOptions, SnapshotSummary } from './types'

export class SnapshotManager {
  summary: SnapshotSummary = undefined!
  resolvedPaths = new Set<string>()
  extension = '.snap'

  constructor(public options: Omit<SnapshotStateOptions, 'snapshotEnvironment'>) {
    this.clear()
  }

  clear() {
    this.summary = emptySummary(this.options)
  }

  add(result: SnapshotResult) {
    addSnapshotResult(this.summary, result)
  }

  resolvePath(testPath: string) {
    const resolver = this.options.resolveSnapshotPath || (() => {
      return join(
        join(
          dirname(testPath),
          '__snapshots__',
        ),
        `${basename(testPath)}${this.extension}`,
      )
    })

    const path = resolver(testPath, this.extension)
    this.resolvedPaths.add(path)
    return path
  }

  resolveRawPath(testPath: string, rawPath: string) {
    return isAbsolute(rawPath)
      ? rawPath
      : resolve(dirname(testPath), rawPath)
  }
}

export function emptySummary(options: Omit<SnapshotStateOptions, 'snapshotEnvironment'>): SnapshotSummary {
  const summary = {
    added: 0,
    failure: false,
    filesAdded: 0,
    filesRemoved: 0,
    filesRemovedList: [],
    filesUnmatched: 0,
    filesUpdated: 0,
    matched: 0,
    total: 0,
    unchecked: 0,
    uncheckedKeysByFile: [],
    unmatched: 0,
    updated: 0,
    didUpdate: options.updateSnapshot === 'all',
  }
  return summary
}

export function addSnapshotResult(summary: SnapshotSummary, result: SnapshotResult): void {
  if (result.added) {
    summary.filesAdded += result.added;
    summary.added += result.added;
  }
  if (result.filesDeleted) {
    summary.filesRemoved += result.filesDeleted;
  }
  if (result.unmatched) {
    summary.filesUnmatched += result.unmatched;
    summary.unmatched += result.unmatched;
  }
  if (result.updated) {
    summary.filesUpdated += result.updated;
    summary.updated += result.updated;
  }

  summary.matched += result.matched;
  summary.unchecked += result.unchecked;

  if (result.uncheckedKeys && result.uncheckedKeys.length > 0) {
    summary.uncheckedKeysByFile.push({
      filePath: result.filepath, // Assuming filepath is the correct property name
      keys: result.uncheckedKeys,
    });
  }

  summary.total += result.added + result.matched + result.unmatched + result.updated;
}