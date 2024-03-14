<script>
  const EXPLANATIONS = {
    SyntaxError: {
      'Unterminated template': {
        text: ['JavaScript expects backticks to come in pairs. Most likely, you\’re either missing a 2nd backtick or have a single that needs to be deleted. You may also need to add a forward slash to “escape” a backtick in your text.'],
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unterminated_string_literal',
        linkTitle: 'Mozilla Developer: Syntax Error: Unterminated string literal'
      },
      'Unterminated string constant': {
        text: ['JavaScript expects quotes to come in pairs. Most likely, you\’re either missing a 2nd quote or need to delete a stray. You may also need to add a forward slash to “escape” a quote in your text.'],
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unterminated_string_literal',
        linkTitle: 'Mozilla Developer: Syntax Error: Unterminated string literal'
      },
      'Unexpected character \'@\'': {
        text: [
          'This means JavaScript ran into a punctuation mark it couldn\'t process.',
          'If you\'ve got text that you don\'t want to be treated as code, wrap it in quotes.'
        ],
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unexpected_token',
        linkTitle: 'Mozilla Developer: Syntax Error: Unexpected token'
      },
      'Unexpected token': {
        text: [
          'This means you used a JavaScript keyword, but didn’t continue to follow the pattern. As an example, the keyword `if`, needs to be followed by a pair of parentheses with an expression, and those need to be followed by a pair of curly braces, like so:',
          'if (1 > 0) { return "this will always be true" }'
        ],
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unexpected_token',
        linkTitle: 'Mozilla Developer: Syntax Error: Unexpected token'
      },
      'JSON.parse: expected property name or \'}\'': {
        text: [
          'JavaScript ran into an issue reading JSON. This can happen for a lot of reasons, but a classic is using single quotes. Text in JSON has to be wrapped in double quotes, like {“name”: “fred”}. Single quotes, like {‘name’: ‘fred’}, will cause this cryptic error.',
          'This is especially confusing because JSON looks similar to a JavaScript object, where single quotes are allowed.'
        ],
        link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/JSON_bad_parse',
        linkTitle: 'Mozilla Developer: Syntax Error: JSON bad parse'
      }
    }
  }

  export default {
    props: {
      value: {
        type: Error,
        required: true
      }
    },

    data() {
      return {
        expanded: true
      }
    },

    computed: {
      line() {
        return (this.value.pos || {}).line
      },

      column() {
        return (this.value.pos || {}).column
      },

      name() {
        return this.value.name
      },

      plainMessage() {
        return String(this.value.message || '').replace(/\s+\(\d+:\d+\)$/, '')
      },

      explanation() {
        return (EXPLANATIONS[this.name] || {})[this.plainMessage]
      },

      hasExplanation() {
        return this.explanation ? true : false
      },

      explanationLines() {
        return (this.explanation || {}).text || []
      },

      explanationLink() {
        return (this.explanation || {}).link
      },

      hasExplanationLink() {
        return this.explanationLink ? true : false
      },

      explanationLinkTitle() {
        return (this.explanation || {}).linkTitle || this.plainMessage
      }
    }
  }
</script>

<template>
  <div class="error-container">
    <div class="title">
      {{name}} – {{plainMessage}}
      <button class="toggle" v-if="hasExplanation" @click="expanded = ! expanded">
        <span v-if="!expanded">more info…</span>
        <span v-if="expanded">less info…</span>
      </button>
    </div>
    <div v-if="expanded" class="detail">
      <p v-for="line in explanationLines">{{line}}</p>
      <p v-if="hasExplanationLink">
        Further reading:
        <a target="_blank" :href="explanationLink">{{explanationLinkTitle}}</a>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .error-container {
    padding: 1em;
    background-color: var(--background);
    color: var(--on-background);
    border-radius: 6px;

    .title {
      color: var(--error);
    }

    .toggle {
      margin-left: 2em;
      background: transparent;
      font-size: inherit;
      font-family: inherit;
      color: var(--link);
      font-style: italic;
      text-decoration: underline;
      cursor: pointer;
    }

    .detail {
      p {
        margin: 0.5em 0;
      }

      a {
        color: var(--link);
        text-decoration: underline;
      }
    }
  }
</style>
