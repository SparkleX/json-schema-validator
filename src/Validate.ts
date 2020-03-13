#!/usr/bin/env node
import * as jsonfile from "jsonfile";
import * as glob from "glob";
import * as jsRefParser from "json-schema-ref-parser";
import { Validator } from "jsonschema";

var validator = new Validator();

async function main() {
	var settings = jsonfile.readFileSync("json-schema-validator.json");
	var schemas = settings["json.schemas"];

	for (var schema of schemas) {
		console.debug(`load schema: ${schema.url}`);
		let jsonSchema = await jsRefParser.dereference(schema.url);

		for (var fileMatch of schema.fileMatch) {
			console.debug(`match files: ${fileMatch}`);
			var files = glob.sync(fileMatch, { matchBase: true });

			for (var file of files) {
				console.debug(file);
				var instance = jsonfile.readFileSync(file);
				var result = validator.validate(instance, jsonSchema);
				if(result.errors.length>0){
					throw result.errors[0].message;
				}
			}
		}
	}
}

main().catch(e => {
	console.error(`error: ${e}`);
	process.exit(-1);
});
