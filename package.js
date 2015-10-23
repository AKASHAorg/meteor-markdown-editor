Package.describe({
    name: 'akasha:markdown-editor',
    version: '0.0.4',
    // Brief, one-line summary of the package.
    summary: 'simple markdown editor for meteor',
    // URL to the Git repository containing the source code for this package.
    git: 'https://github.com/AkashaProject/meteor-markdown-editor',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.2.0.2');
    api.imply('templating');
    api.use('underscore', 'client');
    api.use('ecmascript');
    api.use('less');
    api.use('jquery');
    api.use('blaze-html-templates');
    api.use('chuangbo:marked@0.3.5_1');
    api.use('twbs:bootstrap@3.3.5');
    api.use('perak:codemirror@1.2.8');
    api.use('ajduke:bootstrap-tagsinput@0.7.0');
    api.addFiles('lib/client/views/markdown-editor.html', 'client');
    api.addFiles('lib/client/views/markdown-editor.js', 'client');
    api.addFiles('lib/client/styles/markdown-editor.less', 'client');
    api.export('MarkdownEditor', 'client');
});
