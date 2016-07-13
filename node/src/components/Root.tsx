import * as React from 'react'
import * as ReactDom from 'react-dom'
import App from './App'

export default function root() {
  ReactDom.render(
    <App />,
    document.querySelector('#root')
  )
}
