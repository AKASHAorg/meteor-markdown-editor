class MarkdownManager {
    /**
     *
     * @param editor
     * @param $toolbar
     * @param pageOffset
     * @param tags
     * @param postTitle
     */
    constructor(editor=false, $toolbar=false, pageOffset=false, tags=false, postTitle=false) {
        this.editor = editor;
        this.$toolbar = $toolbar;
        this.pageOffset = pageOffset;
        this.tags = tags;
        this.postTitle = postTitle;
    }

    /**
     * cleanup data when template is destroyed
     */
    cleanup() {
        this.editor = false;
        this.$toolbar = false;
        this.pageOffset = false;
        this.tags = false;
        this.postTitle = false;
    }

    /**
     * get markdown data from codemirror
     * @returns {*}
     */

    getMd() {
        return this.editor ? this.editor.getValue(): false
    }

    /**
     * get rendered html from markdown editor
     * @returns {*}
     */

    getHtml() {
        return this.getMd() ? marked(this.getMd()) : false;
    }

    /**
     * get post tags
     * @returns {*|boolean}
     */
    getTags() {
        return this.tags;
    }

    /**
     * get post title
     * @returns {*|boolean}
     */

    getPostTitle() {
        return this.postTitle;
    }

    /**
     * get all info from markdown editor
     * @returns {{md: *, html: *, tags: (*|boolean), title: (*|boolean)}}
     */

    getData() {
        return {
            'md': this.getMd(),
            'html': this.getHtml(),
            'tags': this.getTags(),
            'title': this.getPostTitle()
        }
    }
}

MarkdownEditor = new MarkdownManager();

/**
 *
 * Codemirror helper for bold selection
 * @param cm
 */
const boldSelection = function (cm) {
    const selection = cm.getSelection();
    cm.replaceSelection(`**${selection}**`, "end", "+input");
    cm.focus();
};
/**
 *
 * Helper for <h></h> tag from toolbar
 * @param cm
 * @param count
 */
const headSelection = function (cm, count) {
    count = parseInt(count);
    const selection = cm.getSelection();
    const prefix = "#".repeat(count);
    cm.replaceSelection(`${prefix} ${selection}`, "end", "+input");
    cm.focus();
};
/**
 * Codemirror helper for <em>selection</em>
 * @param cm
 */
const emphasizeSelection = function (cm) {
    const selection = cm.getSelection();
    cm.replaceSelection(`*${selection}*`, "end", "+input");
    cm.focus();
};
/**
 * Codemirror helper for <del>selection</del>
 * @param cm
 */
const strikeSelection = function (cm) {
    const selection = cm.getSelection();
    cm.replaceSelection(`~~${selection}~~`, "end", "+input");
    cm.focus();
};
/**
 * Codemirror helper for <del>selection</del>
 * @param cm
 */
const linkSelection = function (cm) {
    const selection = cm.getSelection();
    cm.replaceSelection(`[${selection}](http://)`, "end", "+input");
    cm.focus();
};
/**
 *
 * Codemirror helper for <code>selection</code>
 * @param cm
 */
const codeSelection = function (cm) {
    const selection = cm.getSelection();
    cm.replaceSelection(`\`${selection}\``, "end", "+input");
    cm.focus();
};

/**
 * Codemirror helper for <img>
 * @param cm
 */
const imgSelection = function (cm) {
    const selection = cm.getSelection();
    cm.replaceSelection(`![${selection}](http://)`, "end", "+input");
    cm.focus();
};

/**
 *
 * Codemirror macro for <li>
 * @param cm
 */
const listSelection = function (cm) {
    const selection = cm.getSelection();
    cm.replaceSelection(`* ${selection}`, "end", "+input");
    cm.focus();
};

/**
 *
 * Codemirror macro for <quote>
 * @param cm
 */
const quoteSelection = function (cm) {
    const selection = cm.getSelection();
    cm.replaceSelection(`> ${selection}`, "end", "+input");
    cm.focus();
};

Template['markdown_editor'].events({

    /**
     *
     *Sync scrolls on editor and preview area
     */
    'scroll .CodeMirror-scroll': _.debounce((e)=> {

        const $target = $(e.target);
        const $mdPreview = $("#md-preview");
        const scrollableMD = $(".CodeMirror-vscrollbar").first().prop('scrollHeight');
        const scrollablePreview = $mdPreview.prop('scrollHeight');

        const scrollTop = $target.scrollTop();
        const clientHeight = $target.prop('clientHeight');

        const adjustRatio = scrollTop / (scrollableMD - clientHeight);
        const previewPostition = scrollablePreview * adjustRatio;


        $mdPreview.scrollTop(previewPostition);
    }, 5),

    /**
     * Init toolbar functionality
     * @param e
     * @param tpl
     */
    'click .has-cm button': (e)=> {
        const $target = $(e.currentTarget);
        const macro = $target.attr('data-cm');

        switch (macro) {
            case 'bold':
                boldSelection(MarkdownEditor.editor);
                break;
            case 'emphasize':
                emphasizeSelection(MarkdownEditor.editor);
                break;
            case 'strike':
                strikeSelection(MarkdownEditor.editor);
                break;
            case 'link':
                linkSelection(MarkdownEditor.editor);
                break;
            case 'list':
                listSelection(MarkdownEditor.editor);
                break;
            case 'code':
                codeSelection(MarkdownEditor.editor);
                break;
            case 'img':
                imgSelection(MarkdownEditor.editor);
                break;
            default :
                console.error(`${macro} is not defined`)
        }
    },

    /**
     * Transform selection to heading
     * @param e
     * @param tpl
     */
    'click #cm-heading a': (e)=> {
        const $target = $(e.currentTarget);
        const repeat = $target.attr("data-cm");
        headSelection(MarkdownEditor.editor, repeat);
    },

    /**
     * Transform tags into labels
     * @param e
     * @param tpl
     */
    'hide.bs.modal #tags-container': (e)=> {
        MarkdownEditor.tags = $("#editor-tags").tagsinput('items');

        const tagsPreview = MarkdownEditor.tags.map((e)=> {
            return '<span class="label label-info">' + e + '</span>';
        });
        $("#tags-preview").html(tagsPreview);

    },

    /**
     * Keep template var postTitle updated
     * @param e
     * @param tpl
     */
    'change #post-title': (e)=> {
        MarkdownEditor.postTitle = $(e.target).val().trim();
    }
});


/**
 *
 * Init 3rd party plugins and fill template vars with data
 */
Template['markdown_editor'].onRendered(function () {

    this.autorun(()=> {

        MarkdownEditor.editor = CodeMirror.fromTextArea(this.find('#md-editor'), {
            lineNumbers: false,
            mode: 'gfm',
            theme: '3024-day',
            tabMode: 'indent',
            gutter: true,
            lineWrapping: true,
            extraKeys: {
                "Ctrl-B": boldSelection,
                "Cmd-B": boldSelection,
                "Ctrl-I": emphasizeSelection,
                "Cmd-I": emphasizeSelection,
                "Ctrl-Alt-U": strikeSelection,
                "Cmd-Alt-U": strikeSelection,
                "Ctrl-K": linkSelection,
                "Cmd-K": linkSelection,
                "Ctrl-Alt-K": codeSelection,
                "Cmd-Alt-K": codeSelection,
                "Ctrl-Alt-I": imgSelection,
                "Cmd-Alt-I": imgSelection,
                "Ctrl-L": listSelection,
                "Cmd-L": listSelection,
                "Ctrl-Q": quoteSelection,
                "Cmd-Q": quoteSelection

            }
        });

        MarkdownEditor.$toolbar = $("#cm-toolbar");
        MarkdownEditor.$toolbar.width = MarkdownEditor.$toolbar.width();
        MarkdownEditor.pageOffset = MarkdownEditor.editor.charCoords({line: 0, ch: 0});

        /**
         * Render to html preview when typing
         */
        MarkdownEditor.editor.on('change', ()=> {
            const content = MarkdownEditor.editor.getValue();
            const rawHtml = marked(content);
            let wordCount = 0;
            if (rawHtml.length > 0) {
                matchWords = content.match(/[^~`!¡@#$%^&*()_\-+={}\[\]|\\:;"'<,>.?¿\/\s]+/g);
                wordCount = matchWords ? matchWords.length : 0;
            }
            $('#md-preview').html(rawHtml);
            $("#word-count").html(wordCount);
        });

        /**
         * Place toolbar on cursor position
         * This is triggered on selecting text from editor
         */
        MarkdownEditor.editor.on('cursorActivity', _.debounce((cm)=> {
            const selection = cm.getSelection();
            const spacing = 25;

            if (selection.trim() != '') {
                const posStart = cm.getCursor(true);
                const posEnd = cm.getCursor(false);

                const coordsStart = cm.charCoords(posStart);
                const coordsEnd = cm.charCoords(posEnd);
                const $cmWrap = $(".CodeMirror-wrap");
                const viewHeight = $cmWrap.height();
                const viewWidth = $cmWrap.width();

                const area = coordsStart.left + MarkdownEditor.$toolbar.width;
                let options = {};


                if (viewHeight > coordsEnd.bottom) {
                    options['top'] = coordsEnd.top + spacing;
                } else {
                    options['top'] = coordsEnd.top - spacing - 15;
                }

                if (area <= viewWidth) {
                    options['left'] = coordsStart.left;
                } else {
                    options['left'] = coordsStart.left - MarkdownEditor.$toolbar.width - coordsStart.right + coordsEnd.left;
                }

                MarkdownEditor.$toolbar.css(options);
                MarkdownEditor.$toolbar.removeClass('invisible');
            } else {
                if (MarkdownEditor.$toolbar.is(':visible')) {
                    MarkdownEditor.$toolbar.addClass('invisible');
                }
            }
        }, 300));

        /**
         *
         * Init tags plugin
         * @link https://timschlechter.github.io/bootstrap-tagsinput/examples/
         * @link https://atmospherejs.com/ajduke/bootstrap-tagsinput
         */

        $("#editor-tags").tagsinput({
            maxTags: 10,
            trimValue: true
        });

    })

});

Template['markdown_editor'].onDestroyed(function () {
    MarkdownEditor.cleanup();
})