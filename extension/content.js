async function saveQuestionData(tags) {
  const question = document.querySelector('.question')

  const owner = question.querySelector('.owner .user-info .user-details a')
  const authorName = owner.innerText
  const authorId = owner.href.split('/')[2]
  const accountId = authorId
  const authorLink = owner.href

  const title = document.querySelector('#question-header .question-hyperlink').innerText

  const link = window.location.href

  const query = new URLSearchParams({ authorName, accountId, authorId, authorLink, tags, title, link })

  await fetch(`http://localhost:3000/api/save?${query.toString()}`, {
    method: 'GET',
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
  })
}

async function fetchRelatedData(tags) {
    const response = await fetch(`http://localhost:3000/api/related?tags=${tags}`, {
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
    const jsonResp = await response.json()

    const data = jsonResp?.body?.data

    return data || { snippets: [], questions: [] }
  }

  function removeFirstNLines(content, n) {
    const lines = content.split('\n')
    const remainingLines = lines.slice(n)
    return remainingLines.join('\n')
  }
  
  function getTags() {
    return Array.from(document.querySelectorAll('.js-post-tag-list-wrapper li a')).map(tag => tag.innerText).join(',')
  }
  
  // Função para criar o painel de resultados na página
  function createResultsPanel(snippets, questions) {
    const panel = document.createElement('div')
    panel.id = 'related-snippets-panel'

    const panelContent = document.createElement('div')
    panelContent.id = 'panel-content'
    panel.appendChild(panelContent)

    const logo = document.createElement('img')
    logo.src = chrome.runtime.getURL("logo.svg");
    logo.alt = 'Logo'
    panelContent.appendChild(logo)

    const divider = document.createElement('hr')
    panelContent.appendChild(divider)
    
    const panelButtonToggle = document.createElement('button')
    panelButtonToggle.id = 'panel-button-toggle'
    panelButtonToggle.onclick = togglePanel
    panel.appendChild(panelButtonToggle)
    
    const snippetTitle = document.createElement('h3')
    snippetTitle.innerText = 'Related Snippets'
    panelContent.appendChild(snippetTitle)

    const snippetDescription = document.createElement('p')
    snippetDescription.innerText = 'Snippets are code examples that can help you to solve your problem.'
    panelContent.appendChild(snippetDescription)
  
    snippets.forEach(snippet => {
      const snippetLink = document.createElement('a')
      snippetLink.href = `${snippet.link}#L${snippet.startsAtLine}`
      snippetLink.innerText = snippet.description
      snippetLink.target = '_blank'
      panelContent.appendChild(snippetLink)
    })
  
    const questionsTitle = document.createElement('h3')
    questionsTitle.innerText = 'Related Questions'
    panelContent.appendChild(questionsTitle)

    const questionsDescription = document.createElement('p')
    questionsDescription.innerText = 'Below you can find some questions that may help you to understand the problem.'
    panelContent.appendChild(questionsDescription)
  
    questions.forEach(question => {
      const questionLink = document.createElement('a')
      questionLink.href = question.link
      questionLink.innerText = question.description
      questionLink.target = '_blank'
      panelContent.appendChild(questionLink)
    })
  
    document.body.appendChild(panel)
  }

  function insertSnippetsAfterQuestion(snippets) {
    const question = document.querySelector('#question')

    if (!snippets.length) return

    const title = document.createElement('h2')
    title.innerText = 'Related Snippets'
    title.id = 'related-snippets-title'
    question.insertAdjacentElement('afterend', title)

    snippets.forEach(snippet => {
      const snippetAnswer = document.createElement('div')
      snippetAnswer.classList.add('snippet-answer')
      snippetAnswer.classList.add('post-layout')

      const snippetTitle = document.createElement('h3')
      snippetTitle.classList.add('post-layout--left')
      snippetTitle.innerText = 'Snippet'
      snippetAnswer.appendChild(snippetTitle)

      const snippetContent = document.createElement('div')
      snippetContent.classList.add('snippet-content')
      snippetContent.classList.add('post-layout--right')
      snippetAnswer.appendChild(snippetContent)

      const snippetDescription = document.createElement('p')
      snippetDescription.innerText = snippet.description
      snippetContent.appendChild(snippetDescription)

      const snippetCode = document.createElement('pre')
      snippetCode.innerText = removeFirstNLines(snippet.file.content, snippet.startsAtLine - 1);
      snippetCode.onclick = () => openLinkInNewTab(`${snippet.link}#L${snippet.startsAtLine}`)
      snippetContent.appendChild(snippetCode)

      const snippetDetails = document.createElement('p')
      snippetDetails.innerText = `This snippet was created by André Saraiva and was considered related with this question with base on follow tags: ${snippet.tags.join(', ')}`
      snippetContent.appendChild(snippetDetails)

      title.insertAdjacentElement('afterend', snippetAnswer)
    })
  }

  function openLinkInNewTab(url) {
    const win = window.open(url, '_blank')
    win.focus()
  }

  function togglePanel() {
    const panel = document.getElementById('related-snippets-panel')
    panel.classList.toggle('opened')
  }
  
  (async function () {
    const tags = getTags()
    if (tags.length > 0) {
      const { snippets, questions } = await fetchRelatedData(tags)
      saveQuestionData(tags)
      createResultsPanel(snippets, questions)
      insertSnippetsAfterQuestion(snippets)
    }
  })()
  