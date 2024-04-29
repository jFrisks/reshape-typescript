import * as glob from 'glob';
import { readFileSync } from 'fs';
import * as path from 'path';
import natsort from 'natsort';
import { parse } from 'toml';

const DEFAULT_SEARCH_PATH = '"$user", public';

export function schema_query(...dirs: string[]): string {
    const path = search_path(...dirs) || DEFAULT_SEARCH_PATH;
    return `SET search_path TO ${path}`;
}

function search_path(...dirs: string[]): string | null {
    if (dirs.length === 0) {
        dirs = ["migrations"];
    }

    const migrations = find_migrations(dirs);

    console.debug("migrations", migrations);

    if (migrations.length === 0) {
        return null;
    } else {
        const last_migration = migrations[migrations.length - 1];
        return `migration_${last_migration}`;
    }
}

function find_migrations(dirs: string[]): string[] {
    // Find all files across all specified directories
    const files = dirs.flatMap(dir => glob.sync(`${dir}/*`))

    console.debug("before sorted_files", files);
    // Sort files by their names
    let sorter = natsort();
    const sorted_files = files.sort(
        (path_a, path_b) => sorter(path.basename(path_a), path.basename(path_b))
    );

    console.debug("sorted_files", sorted_files);

    const migrations = sorted_files.map(migration_name_for_file);
    return migrations;
}

function migration_name_for_file(file_path: string): string {
    const { name } = path.parse(file_path as string);
    const contents = readFileSync(file_path, "utf-8");
    const migration = decode_migration(file_path, contents);


    if ("name" in migration) {
        return migration["name"] as string;
    } else {
        return name;
    }
}

function decode_migration(file_path: string, contents: string): object {
    if (contents.length === 0) {
        return {};
    }

    const { ext } = path.parse(file_path as string);
    if (ext === ".toml") {
        return parse(contents);
    } else if (ext === ".json") {
        return JSON.parse(contents);
    } else {
        throw new Error(`Unrecognized migration file extension ${ext}`);
    }
}
