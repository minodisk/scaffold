import * as React from 'react'
import * as ReactDom from 'react-dom'
import App from './components/App'

ReactDom.render(
  <App />,
  document.querySelector('#root')
)

if (module.hot != null) {
  module.hot.accept()
}
