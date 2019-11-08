//
// Types copied from api-extractor, so we can use some version of the types without a dependency.
// Copied from version 7.3.7.
//

declare module '@microsoft/api-extractor' {
  /**
   * This class represents the TypeScript compiler state.  This allows an optimization where multiple invocations
   * of API Extractor can reuse the same TypeScript compiler analysis.
   */
  export class CompilerState {
    /**
     * The TypeScript compiler's `Program` object, which represents a complete scope of analysis.
     * Actual type is `ts.Program`.
     */
    readonly program: any;
    private constructor();
    /**
     * Create a compiler state for use with the specified `IExtractorInvokeOptions`.
     */
    static create(extractorConfig: ExtractorConfig, options?: ICompilerStateCreateOptions): CompilerState;
  }

  /**
   * Unique identifiers for console messages reported by API Extractor.
   *
   * @remarks
   *
   * These strings are possible values for the {@link ExtractorMessage.messageId} property
   * when the `ExtractorMessage.category` is {@link ExtractorMessageCategory.Console}.
   */
  export const enum ConsoleMessageId {
    /**
     * "Found metadata in ___"
     */
    FoundTSDocMetadata = 'console-found-tsdoc-metadata',
    /**
     * "Writing: ___"
     */
    WritingDocModelFile = 'console-writing-doc-model-file',
    /**
     * "Writing package typings: ___"
     */
    WritingDtsRollup = 'console-writing-dts-rollup',
    /**
     * "You have changed the public API signature for this project.
     * Please copy the file ___ to ___, or perform a local build (which does this automatically).
     * See the Git repo documentation for more info."
     *
     * OR
     *
     * "The API report file is missing.
     * Please copy the file ___ to ___, or perform a local build (which does this automatically).
     * See the Git repo documentation for more info."
     */
    ApiReportNotCopied = 'console-api-report-not-copied',
    /**
     * "You have changed the public API signature for this project.  Updating ___"
     */
    ApiReportCopied = 'console-api-report-copied',
    /**
     * "The API report is up to date: ___"
     */
    ApiReportUnchanged = 'console-api-report-unchanged',
    /**
     * "The API report file was missing, so a new file was created. Please add this file to Git: ___"
     */
    ApiReportCreated = 'console-api-report-created',
    /**
     * "Unable to create the API report file. Please make sure the target folder exists: ___"
     */
    ApiReportFolderMissing = 'console-api-report-folder-missing',
    /**
     * Used for the information printed when the "--diagnostics" flag is enabled.
     */
    Diagnostics = 'console-diagnostics'
  }

  /**
   * The starting point for invoking the API Extractor tool.
   * @public
   */
  export class Extractor {
    /**
     * Returns the version number of the API Extractor NPM package.
     */
    static readonly version: string;
    /**
     * Returns the package name of the API Extractor NPM package.
     */
    static readonly packageName: string;
    /**
     * Load the api-extractor.json config file from the specified path, and then invoke API Extractor.
     */
    static loadConfigAndInvoke(configFilePath: string, options?: IExtractorInvokeOptions): ExtractorResult;
    /**
     * Invoke API Extractor using an already prepared `ExtractorConfig` object.
     */
    static invoke(extractorConfig: ExtractorConfig, options?: IExtractorInvokeOptions): ExtractorResult;
  }

  /**
   * The `ExtractorConfig` class loads, validates, interprets, and represents the api-extractor.json config file.
   * @public
   */
  export class ExtractorConfig {
    /**
     * The JSON Schema for API Extractor config file (api-extractor.schema.json).
     */
    static readonly jsonSchema: object;
    /**
     * The config file name "api-extractor.json".
     */
    static readonly FILENAME: string;
    /** {@inheritDoc IConfigFile.projectFolder} */
    readonly projectFolder: string;
    /**
     * The parsed package.json file for the working package, or undefined if API Extractor was invoked without
     * a package.json file.
     */
    readonly packageJson: object | undefined;
    /**
     * The absolute path of the folder containing the package.json file for the working package, or undefined
     * if API Extractor was invoked without a package.json file.
     */
    readonly packageFolder: string | undefined;
    /** {@inheritDoc IConfigFile.mainEntryPointFilePath} */
    readonly mainEntryPointFilePath: string;
    /** {@inheritDoc IConfigCompiler.tsconfigFilePath} */
    readonly tsconfigFilePath: string;
    /** {@inheritDoc IConfigCompiler.overrideTsconfig} */
    readonly overrideTsconfig: {} | undefined;
    /** {@inheritDoc IConfigCompiler.skipLibCheck} */
    readonly skipLibCheck: boolean;
    /** {@inheritDoc IConfigApiReport.enabled} */
    readonly apiReportEnabled: boolean;
    /** The `reportFolder` path combined with the `reportFileName`. */
    readonly reportFilePath: string;
    /** The `reportTempFolder` path combined with the `reportFileName`. */
    readonly reportTempFilePath: string;
    /** {@inheritDoc IConfigDocModel.enabled} */
    readonly docModelEnabled: boolean;
    /** {@inheritDoc IConfigDocModel.apiJsonFilePath} */
    readonly apiJsonFilePath: string;
    /** {@inheritDoc IConfigDtsRollup.enabled} */
    readonly rollupEnabled: boolean;
    /** {@inheritDoc IConfigDtsRollup.untrimmedFilePath} */
    readonly untrimmedFilePath: string;
    /** {@inheritDoc IConfigDtsRollup.betaTrimmedFilePath} */
    readonly betaTrimmedFilePath: string;
    /** {@inheritDoc IConfigDtsRollup.publicTrimmedFilePath} */
    readonly publicTrimmedFilePath: string;
    /** {@inheritDoc IConfigDtsRollup.omitTrimmingComments} */
    readonly omitTrimmingComments: boolean;
    /** {@inheritDoc IConfigTsdocMetadata.enabled} */
    readonly tsdocMetadataEnabled: boolean;
    /** {@inheritDoc IConfigTsdocMetadata.tsdocMetadataFilePath} */
    readonly tsdocMetadataFilePath: string;
    /** {@inheritDoc IConfigFile.messages} */
    readonly messages: IExtractorMessagesConfig;
    /** {@inheritDoc IConfigFile.testMode} */
    readonly testMode: boolean;
    private constructor();
    /**
     * Returns a JSON-like string representing the `ExtractorConfig` state, which can be printed to a console
     * for diagnostic purposes.
     *
     * @remarks
     * This is used by the "--diagnostics" command-line option.  The string is not intended to be deserialized;
     * its format may be changed at any time.
     */
    getDiagnosticDump(): string;
    /**
     * Returns a simplified file path for use in error messages.
     * @internal
     */
    _getShortFilePath(absolutePath: string): string;
    /**
     * Loads the api-extractor.json config file from the specified file path, and prepares an `ExtractorConfig` object.
     *
     * @remarks
     * Loads the api-extractor.json config file from the specified file path.   If the "extends" field is present,
     * the referenced file(s) will be merged.  For any omitted fields, the API Extractor default values are merged.
     *
     * The result is prepared using `ExtractorConfig.prepare()`.
     */
    static loadFileAndPrepare(configJsonFilePath: string): ExtractorConfig;
    /**
     * Performs only the first half of {@link ExtractorConfig.loadFileAndPrepare}, providing an opportunity to
     * modify the object before it is passed to {@link ExtractorConfig.prepare}.
     *
     * @remarks
     * Loads the api-extractor.json config file from the specified file path.   If the "extends" field is present,
     * the referenced file(s) will be merged.  For any omitted fields, the API Extractor default values are merged.
     */
    static loadFile(jsonFilePath: string): IConfigFile;
    /**
     * Prepares an `ExtractorConfig` object using a configuration that is provided as a runtime object,
     * rather than reading it from disk.  This allows configurations to be constructed programmatically,
     * loaded from an alternate source, and/or customized after loading.
     */
    static prepare(options: IExtractorConfigPrepareOptions): ExtractorConfig;
    /**
     * Returns true if the specified file path has the ".d.ts" file extension.
     */
    static hasDtsFileExtension(filePath: string): boolean;
  }

  /**
   * Used with {@link IConfigMessageReportingRule.logLevel} and {@link IExtractorInvokeOptions.messageCallback}.
   *
   * @remarks
   * This is part of the {@link IConfigFile} structure.
   */
  export const enum ExtractorLogLevel {
    /**
     * The message will be displayed as an error.
     *
     * @remarks
     * Errors typically cause the build to fail and return a nonzero exit code.
     */
    Error = 'error',
    /**
     * The message will be displayed as an warning.
     *
     * @remarks
     * Warnings typically cause a production build fail and return a nonzero exit code.  For a non-production build
     * (e.g. using the `--local` option with `api-extractor run`), the warning is displayed but the build will not fail.
     */
    Warning = 'warning',
    /**
     * The message will be displayed as an informational message.
     *
     * @remarks
     * Informational messages may contain newlines to ensure nice formatting of the output,
     * however word-wrapping is the responsibility of the message handler.
     */
    Info = 'info',
    /**
     * The message will be displayed only when "verbose" output is requested, e.g. using the `--verbose`
     * command line option.
     */
    Verbose = 'verbose',
    /**
     * The message will be discarded entirely.
     */
    None = 'none'
  }

  /**
   * This object is used to report an error or warning that occurred during API Extractor's analysis.
   */
  export class ExtractorMessage {
    /**
     * The category of issue.
     */
    readonly category: ExtractorMessageCategory;
    /**
     * A text string that uniquely identifies the issue type.  This identifier can be used to suppress
     * or configure the reporting of issues, and also to search for help about an issue.
     */
    readonly messageId: /*tsdoc.TSDocMessageId |*/ ExtractorMessageId | ConsoleMessageId | string;
    /**
     * The text description of this issue.
     */
    readonly text: string;
    /**
     * The absolute path to the affected input source file, if there is one.
     */
    readonly sourceFilePath: string | undefined;
    /**
     * The line number where the issue occurred in the input source file.  This is not used if `sourceFilePath`
     * is undefined.  The first line number is 1.
     */
    readonly sourceFileLine: number | undefined;
    /**
     * The column number where the issue occurred in the input source file.  This is not used if `sourceFilePath`
     * is undefined.  The first column number is 1.
     */
    readonly sourceFileColumn: number | undefined;
    /**
     * Additional contextual information about the message that may be useful when reporting errors.
     * All properties are optional.
     */
    readonly properties: IExtractorMessageProperties;
    /**
     * If the {@link IExtractorInvokeOptions.messageCallback} sets this property to true, it will prevent the message
     * from being displayed by API Extractor.
     *
     * @remarks
     * If the `messageCallback` routes the message to a custom handler (e.g. a toolchain logger), it should
     * assign `handled = true` to prevent API Extractor from displaying it.  Assigning `handled = true` for all messages
     * would effectively disable all console output from the `Extractor` API.
     *
     * If `handled` is set to true, the message will still be included in the count of errors/warnings;
     * to discard a message entirely, instead assign `logLevel = none`.
     */
    handled: boolean;
    /**
     * Specifies how the message should be reported.
     *
     * @remarks
     * If the {@link IExtractorInvokeOptions.messageCallback} handles the message (i.e. sets `handled = true`),
     * it can use the `logLevel` to determine how to display the message.
     *
     * Alternatively, if API Extractor is handling the message, the `messageCallback` could assign `logLevel` to change
     * how it will be processed.  However, in general the recommended practice is to configure message routing
     * using the `messages` section in api-extractor.json.
     *
     * To discard a message entirely, assign `logLevel = none`.
     */
    logLevel: ExtractorLogLevel;
    /**
     * Returns the message formatted with its identifier and file position.
     * @remarks
     * Example:
     * ```
     * src/folder/File.ts:123:4 - (ae-extra-release-tag) The doc comment should not contain more than one release tag.
     * ```
     */
    formatMessageWithLocation(workingPackageFolderPath: string | undefined): string;
    formatMessageWithoutLocation(): string;
  }

  /**
   * Specifies a category of messages for use with {@link ExtractorMessage}.
   * @public
   */
  export const enum ExtractorMessageCategory {
    /**
     * Messages originating from the TypeScript compiler.
     *
     * @remarks
     * These strings begin with the prefix "TS" and have a numeric error code.
     * Example: `TS2551`
     */
    Compiler = 'Compiler',
    /**
     * Messages related to parsing of TSDoc comments.
     *
     * @remarks
     * These strings begin with the prefix "tsdoc-".
     * Example: `tsdoc-link-tag-unescaped-text`
     */
    TSDoc = 'TSDoc',
    /**
     * Messages related to API Extractor's analysis.
     *
     * @remarks
     * These strings begin with the prefix "ae-".
     * Example: `ae-extra-release-tag`
     */
    Extractor = 'Extractor',
    /**
     * Console messages communicate the progress of the overall operation.  They may include newlines to ensure
     * nice formatting.  They are output in real time, and cannot be routed to the API Report file.
     *
     * @remarks
     * These strings begin with the prefix "console-".
     * Example: `console-writing-typings-file`
     */
    Console = 'console'
  }

  /**
   * Unique identifiers for messages reported by API Extractor during its analysis.
   *
   * @remarks
   *
   * These strings are possible values for the {@link ExtractorMessage.messageId} property
   * when the `ExtractorMessage.category` is {@link ExtractorMessageCategory.Extractor}.
   */
  export const enum ExtractorMessageId {
    /**
     * "The doc comment should not contain more than one release tag."
     */
    ExtraReleaseTag = 'ae-extra-release-tag',
    /**
     * "This symbol has another declaration with a different release tag."
     */
    DifferentReleaseTags = 'ae-different-release-tags',
    /**
     * "The symbol ___ is marked as ___, but its signature references ___ which is marked as ___."
     */
    IncompatibleReleaseTags = 'ae-incompatible-release-tags',
    /**
     * "___ is exported by the package, but it is missing a release tag (`@alpha`, `@beta`, `@public`, or `@internal`)."
     */
    MissingReleaseTag = 'ae-missing-release-tag',
    /**
     * "The `@packageDocumentation` comment must appear at the top of entry point *.d.ts file."
     */
    MisplacedPackageTag = 'ae-misplaced-package-tag',
    /**
     * "The symbol ___ needs to be exported by the entry point ___."
     */
    ForgottenExport = 'ae-forgotten-export',
    /**
     * "The name ___ should be prefixed with an underscore because the declaration is marked as `@internal`."
     */
    InternalMissingUnderscore = 'ae-internal-missing-underscore',
    /**
     * "The `@preapproved` tag cannot be applied to ___ because it is not a supported declaration type."
     */
    PreapprovedUnsupportedType = 'ae-preapproved-unsupported-type',
    /**
     * "The `@preapproved` tag cannot be applied to ___ without an `@internal` release tag."
     */
    PreapprovedBadReleaseTag = 'ae-preapproved-bad-release-tag',
    /**
     * "The `@inheritDoc` reference could not be resolved".
     */
    UnresolvedInheritDocReference = 'ae-unresolved-inheritdoc-reference',
    /**
     * "The `@inheritDoc` tag needs a TSDoc declaration reference; signature matching is not supported yet".
     *
     * @privateRemarks
     * In the future, we will implement signature matching so that you can write `{@inheritDoc}` and API Extractor
     * will find a corresponding member from a base class (or implemented interface).  Until then, the tag
     * always needs an explicit declaration reference such as `{@inhertDoc MyBaseClass.sameMethod}`.
     */
    UnresolvedInheritDocBase = 'ae-unresolved-inheritdoc-base',
    /**
     * "The `@inheritDoc` tag for ___ refers to its own declaration".
     */
    CyclicInheritDoc = 'ae-cyclic-inherit-doc',
    /**
     * "The `@link` reference could not be resolved".
     */
    UnresolvedLink = 'ae-unresolved-link'
  }

  /**
   * This object represents the outcome of an invocation of API Extractor.
   */
  export class ExtractorResult {
    /**
     * The TypeScript compiler state that was used.
     */
    readonly compilerState: CompilerState;
    /**
     * The API Extractor configuration that was used.
     */
    readonly extractorConfig: ExtractorConfig;
    /**
     * Whether the invocation of API Extractor was successful.  For example, if `succeeded` is false, then the build task
     * would normally return a nonzero process exit code, indicating that the operation failed.
     *
     * @remarks
     *
     * Normally the operation "succeeds" if `errorCount` and `warningCount` are both zero.  However if
     * {@link IExtractorInvokeOptions.localBuild} is `true`, then the operation "succeeds" if `errorCount` is zero
     * (i.e. warnings are ignored).
     */
    readonly succeeded: boolean;
    /**
     * Returns true if the API report was found to have changed.
     */
    readonly apiReportChanged: boolean;
    /**
     * Reports the number of errors encountered during analysis.
     *
     * @remarks
     * This does not count exceptions, where unexpected issues prematurely abort the operation.
     */
    readonly errorCount: number;
    /**
     * Reports the number of warnings encountered during analysis.
     *
     * @remarks
     * This does not count warnings that are emitted in the API report file.
     */
    readonly warningCount: number;
    /** @internal */
    constructor(properties: ExtractorResult);
  }

  /**
   * Options for {@link CompilerState.create}
   * @public
   */
  export interface ICompilerStateCreateOptions {
    /** {@inheritDoc IExtractorInvokeOptions.typescriptCompilerFolder} */
    typescriptCompilerFolder?: string;
    /**
     * Additional .d.ts files to include in the analysis.
     */
    additionalEntryPoints?: string[];
  }

  /**
   * Configures how the API report files (*.api.md) will be generated.
   *
   * @remarks
   * This is part of the {@link IConfigFile} structure.
   */
  export interface IConfigApiReport {
    /**
     * Whether to generate an API report.
     */
    enabled: boolean;
    /**
     * The filename for the API report files.  It will be combined with `reportFolder` or `reportTempFolder` to produce
     * a full output filename.
     *
     * @remarks
     * The file extension should be ".api.md", and the string should not contain a path separator such as `\` or `/`.
     */
    reportFileName?: string;
    /**
     * Specifies the folder where the API report file is written.  The file name portion is determined by
     * the `reportFileName` setting.
     *
     * @remarks
     * The API report file is normally tracked by Git.  Changes to it can be used to trigger a branch policy,
     * e.g. for an API review.
     *
     * The path is resolved relative to the folder of the config file that contains the setting; to change this,
     * prepend a folder token such as `<projectFolder>`.
     */
    reportFolder?: string;
    /**
     * Specifies the folder where the temporary report file is written.  The file name portion is determined by
     * the `reportFileName` setting.
     *
     * @remarks
     * After the temporary file is written to disk, it is compared with the file in the `reportFolder`.
     * If they are different, a production build will fail.
     *
     * The path is resolved relative to the folder of the config file that contains the setting; to change this,
     * prepend a folder token such as `<projectFolder>`.
     */
    reportTempFolder?: string;
  }

  /**
   * Determines how the TypeScript compiler engine will be invoked by API Extractor.
   *
   * @remarks
   * This is part of the {@link IConfigFile} structure.
   */
  export interface IConfigCompiler {
    /**
     * Specifies the path to the tsconfig.json file to be used by API Extractor when analyzing the project.
     *
     * @remarks
     * The path is resolved relative to the folder of the config file that contains the setting; to change this,
     * prepend a folder token such as `<projectFolder>`.
     *
     * Note: This setting will be ignored if `overrideTsconfig` is used.
     */
    tsconfigFilePath?: string;
    /**
     * Provides a compiler configuration that will be used instead of reading the tsconfig.json file from disk.
     *
     * @remarks
     * The value must conform to the TypeScript tsconfig schema:
     *
     * http://json.schemastore.org/tsconfig
     *
     * If omitted, then the tsconfig.json file will instead be read from the projectFolder.
     */
    overrideTsconfig?: {};
    /**
     * This option causes the compiler to be invoked with the `--skipLibCheck` option.
     *
     * @remarks
     * This option is not recommended and may cause API Extractor to produce incomplete or incorrect declarations,
     * but it may be required when dependencies contain declarations that are incompatible with the TypeScript engine
     * that API Extractor uses for its analysis.  Where possible, the underlying issue should be fixed rather than
     * relying on skipLibCheck.
     */
    skipLibCheck?: boolean;
  }

  /**
   * Configures how the doc model file (*.api.json) will be generated.
   *
   * @remarks
   * This is part of the {@link IConfigFile} structure.
   */
  export interface IConfigDocModel {
    /**
     * Whether to generate a doc model file.
     */
    enabled: boolean;
    /**
     * The output path for the doc model file.  The file extension should be ".api.json".
     *
     * @remarks
     * The path is resolved relative to the folder of the config file that contains the setting; to change this,
     * prepend a folder token such as `<projectFolder>`.
     */
    apiJsonFilePath?: string;
  }

  /**
   * Configures how the .d.ts rollup file will be generated.
   *
   * @remarks
   * This is part of the {@link IConfigFile} structure.
   */
  export interface IConfigDtsRollup {
    /**
     * Whether to generate the .d.ts rollup file.
     */
    enabled: boolean;
    /**
     * Specifies the output path for a .d.ts rollup file to be generated without any trimming.
     *
     * @remarks
     * This file will include all declarations that are exported by the main entry point.
     *
     * If the path is an empty string, then this file will not be written.
     *
     * The path is resolved relative to the folder of the config file that contains the setting; to change this,
     * prepend a folder token such as `<projectFolder>`.
     */
    untrimmedFilePath?: string;
    /**
     * Specifies the output path for a .d.ts rollup file to be generated with trimming for a "beta" release.
     *
     * @remarks
     * This file will include only declarations that are marked as `@public` or `@beta`.
     *
     * The path is resolved relative to the folder of the config file that contains the setting; to change this,
     * prepend a folder token such as `<projectFolder>`.
     */
    betaTrimmedFilePath?: string;
    /**
     * Specifies the output path for a .d.ts rollup file to be generated with trimming for a "public" release.
     *
     * @remarks
     * This file will include only declarations that are marked as `@public`.
     *
     * If the path is an empty string, then this file will not be written.
     *
     * The path is resolved relative to the folder of the config file that contains the setting; to change this,
     * prepend a folder token such as `<projectFolder>`.
     */
    publicTrimmedFilePath?: string;
    /**
     * When a declaration is trimmed, by default it will be replaced by a code comment such as
     * "Excluded from this release type: exampleMember".  Set "omitTrimmingComments" to true to remove the
     * declaration completely.
     */
    omitTrimmingComments?: boolean;
  }

  /**
   * Configuration options for the API Extractor tool.  These options can be constructed programmatically
   * or loaded from the api-extractor.json config file using the {@link ExtractorConfig} class.
   */
  export interface IConfigFile {
    /**
     * Optionally specifies another JSON config file that this file extends from.  This provides a way for
     * standard settings to be shared across multiple projects.
     *
     * @remarks
     * If the path starts with `./` or `../`, the path is resolved relative to the folder of the file that contains
     * the `extends` field.  Otherwise, the first path segment is interpreted as an NPM package name, and will be
     * resolved using NodeJS `require()`.
     */
    extends?: string;
    /**
     * Determines the `<projectFolder>` token that can be used with other config file settings.  The project folder
     * typically contains the tsconfig.json and package.json config files, but the path is user-defined.
     *
     * @remarks
     *
     * The path is resolved relative to the folder of the config file that contains the setting.
     *
     * The default value for `projectFolder` is the token `<lookup>`, which means the folder is determined by traversing
     * parent folders, starting from the folder containing api-extractor.json, and stopping at the first folder
     * that contains a tsconfig.json file.  If a tsconfig.json file cannot be found in this way, then an error
     * will be reported.
     */
    projectFolder?: string;
    /**
     * Specifies the .d.ts file to be used as the starting point for analysis.  API Extractor
     * analyzes the symbols exported by this module.
     *
     * @remarks
     *
     * The file extension must be ".d.ts" and not ".ts".
     * The path is resolved relative to the "projectFolder" location.
     */
    mainEntryPointFilePath: string;
    /**
     * {@inheritDoc IConfigCompiler}
     */
    compiler?: IConfigCompiler;
    /**
     * {@inheritDoc IConfigApiReport}
     */
    apiReport?: IConfigApiReport;
    /**
     * {@inheritDoc IConfigDocModel}
     */
    docModel?: IConfigDocModel;
    /**
     * {@inheritDoc IConfigDtsRollup}
     * @beta
     */
    dtsRollup?: IConfigDtsRollup;
    /**
     * {@inheritDoc IConfigTsdocMetadata}
     * @beta
     */
    tsdocMetadata?: IConfigTsdocMetadata;
    /**
     * {@inheritDoc IExtractorMessagesConfig}
     */
    messages?: IExtractorMessagesConfig;
    /**
     * Set to true when invoking API Extractor's test harness.
     * @remarks
     * When `testMode` is true, the `toolVersion` field in the .api.json file is assigned an empty string
     * to prevent spurious diffs in output files tracked for tests.
     */
    testMode?: boolean;
  }

  /**
   * Configures reporting for a given message identifier.
   *
   * @remarks
   * This is part of the {@link IConfigFile} structure.
   */
  export interface IConfigMessageReportingRule {
    /**
     * Specifies whether the message should be written to the the tool's output log.
     *
     * @remarks
     * Note that the `addToApiReportFile` property may supersede this option.
     */
    logLevel: ExtractorLogLevel;
    /**
     * When `addToApiReportFile` is true:  If API Extractor is configured to write an API report file (.api.md),
     * then the message will be written inside that file; otherwise, the message is instead logged according to
     * the `logLevel` option.
     */
    addToApiReportFile?: boolean;
  }

  /**
   * Specifies a table of reporting rules for different message identifiers, and also the default rule used for
   * identifiers that do not appear in the table.
   *
   * @remarks
   * This is part of the {@link IConfigFile} structure.
   */
  export interface IConfigMessageReportingTable {
    /**
     * The key is a message identifier for the associated type of message, or "default" to specify the default policy.
     * For example, the key might be `TS2551` (a compiler message), `tsdoc-link-tag-unescaped-text` (a TSDOc message),
     * or `ae-extra-release-tag` (a message related to the API Extractor analysis).
     */
    [messageId: string]: IConfigMessageReportingRule;
  }

  /**
   * Configures how the tsdoc-metadata.json file will be generated.
   *
   * @remarks
   * This is part of the {@link IConfigFile} structure.
   */
  export interface IConfigTsdocMetadata {
    /**
     * Whether to generate the tsdoc-metadata.json file.
     */
    enabled: boolean;
    /**
     * Specifies where the TSDoc metadata file should be written.
     *
     * @remarks
     * The path is resolved relative to the folder of the config file that contains the setting; to change this,
     * prepend a folder token such as `<projectFolder>`.
     *
     * The default value is `<lookup>`, which causes the path to be automatically inferred from the `tsdocMetadata`,
     * `typings` or `main` fields of the project's package.json.  If none of these fields are set, the lookup
     * falls back to `tsdoc-metadata.json` in the package folder.
     */
    tsdocMetadataFilePath?: string;
  }

  /**
   * Options for {@link ExtractorConfig.prepare}.
   */
  export interface IExtractorConfigPrepareOptions {
    /**
     * A configuration object as returned by {@link ExtractorConfig.loadFile}.
     */
    configObject: IConfigFile;
    /**
     * The absolute path of the file that the `configObject` object was loaded from.  This is used for error messages
     * and when probing for `tsconfig.json`.
     *
     * @remarks
     *
     * If this is omitted, then the `projectFolder` must not be specified using the `<lookup>` token.
     */
    configObjectFullPath: string | undefined;
    /**
     * The parsed package.json file for the working package, or undefined if API Extractor was invoked without
     * a package.json file.
     *
     * @remarks
     *
     * If omitted, then the `<unscopedPackageName>` and `<packageName>` tokens will have default values.
     */
    packageJson?: object | undefined;
    /**
     * The absolute path of the file that the `packageJson` object was loaded from, or undefined if API Extractor
     * was invoked without a package.json file.
     *
     * @remarks
     *
     * This is used for error messages and when resolving paths found in package.json.
     *
     * If `packageJsonFullPath` is specified but `packageJson` is omitted, the file will be loaded automatically.
     */
    packageJsonFullPath: string | undefined;
  }

  /**
   * Runtime options for Extractor.
   */
  export interface IExtractorInvokeOptions {
    /**
     * An optional TypeScript compiler state.  This allows an optimization where multiple invocations of API Extractor
     * can reuse the same TypeScript compiler analysis.
     */
    compilerState?: CompilerState;
    /**
     * Indicates that API Extractor is running as part of a local build, e.g. on developer's
     * machine.
     *
     * @remarks
     * This disables certain validation that would normally be performed for a ship/production build. For example,
     * the *.api.md report file is automatically updated in a local build.
     *
     * The default value is false.
     */
    localBuild?: boolean;
    /**
     * If true, API Extractor will include {@link ExtractorLogLevel.Verbose} messages in its output.
     */
    showVerboseMessages?: boolean;
    /**
     * If true, API Extractor will print diagnostic information used for troubleshooting problems.
     * These messages will be included as {@link ExtractorLogLevel.Verbose} output.
     *
     * @remarks
     * Setting `showDiagnostics=true` forces `showVerboseMessages=true`.
     */
    showDiagnostics?: boolean;
    /**
     * Specifies an alternate folder path to be used when loading the TypeScript system typings.
     *
     * @remarks
     * API Extractor uses its own TypeScript compiler engine to analyze your project.  If your project
     * is built with a significantly different TypeScript version, sometimes API Extractor may report compilation
     * errors due to differences in the system typings (e.g. lib.dom.d.ts).  You can use the "--typescriptCompilerFolder"
     * option to specify the folder path where you installed the TypeScript package, and API Extractor's compiler will
     * use those system typings instead.
     */
    typescriptCompilerFolder?: string;
    /**
     * An optional callback function that will be called for each `ExtractorMessage` before it is displayed by
     * API Extractor.  The callback can customize the message, handle it, or discard it.
     *
     * @remarks
     * If a `messageCallback` is not provided, then by default API Extractor will print the messages to
     * the STDERR/STDOUT console.
     */
    messageCallback?: (message: ExtractorMessage) => void;
  }

  /**
   * Used by {@link ExtractorMessage.properties}.
   */
  export interface IExtractorMessageProperties {
    /**
     * A declaration can have multiple names if it is exported more than once.
     * If an `ExtractorMessage` applies to a specific export name, this property can indicate that.
     *
     * @remarks
     *
     * Used by {@link ExtractorMessageId.InternalMissingUnderscore}.
     */
    readonly exportName?: string;
  }

  /**
   * Configures how API Extractor reports error and warning messages produced during analysis.
   *
   * @remarks
   * This is part of the {@link IConfigFile} structure.
   */
  export interface IExtractorMessagesConfig {
    /**
     * Configures handling of diagnostic messages generating the TypeScript compiler while analyzing the
     * input .d.ts files.
     */
    compilerMessageReporting?: IConfigMessageReportingTable;
    /**
     * Configures handling of messages reported by API Extractor during its analysis.
     */
    extractorMessageReporting?: IConfigMessageReportingTable;
    /**
     * Configures handling of messages reported by the TSDoc parser when analyzing code comments.
     */
    tsdocMessageReporting?: IConfigMessageReportingTable;
  }

  export {};
}
