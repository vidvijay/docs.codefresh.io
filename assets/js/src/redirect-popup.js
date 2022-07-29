/* eslint-disable compat/compat */
(function ($) {
  'use strict'

  function getDocTypeCookie() {
    return document.cookie.split(';').find(function (item) {
      return item.trim().startsWith('doctype')
    })
  }

  function isLastlyVisitedCsdp(docTypeCookie) {
    var docType = docTypeCookie.split('=').pop()

    return docType === 'ArgoPlatform'
  }

  function isLastlyVisitedClassic(docTypeCookie) {
    var docType = docTypeCookie.split('=').pop()

    return docType === 'Classic'
  }

  function isRedirectedFromCsdpDocs(docTypeCookie) {
    var redirectFromUrl = localStorage.getItem('redirectFrom')

    return isLastlyVisitedClassic(docTypeCookie) && redirectFromUrl && redirectFromUrl.startsWith(location.origin)
  }

  function setDocumentationCookie() {
    document.cookie = 'doctype=ArgoPlatform; SameSite=Lax; Secure; Domain=.codefresh.io; Max-age=2592000; Path=/'
  }

  $(function () {
    if (window.location.hostname === 'localhost') {
      return
    }

    try {
      var docTypeCookie = getDocTypeCookie()
      if (docTypeCookie) {
        var redirectFromUrl = localStorage.getItem('redirectFrom')
        if (isLastlyVisitedCsdp(docTypeCookie)) {
          localStorage.setItem('redirectFrom', window.location.href)
          window.location.href = 'https://codefresh.io/csdp-docs/'
        } else if (isRedirectedFromCsdpDocs(docTypeCookie)) {
          $('#redirectModal').modal({
            backdrop: false,
            show: true
          })
          $('#redirectModal').on('hide.bs.modal', function () {
            localStorage.removeItem('redirectFrom')
          })
          $('#redirectModal .redirect-popup__footer-link').attr('href', redirectFromUrl)
          $('#redirectModal .redirect-popup__footer-link').on('click', setDocumentationCookie)
        }
      }
    } catch (error) {
      console.error(error)
    }
  })
}(jQuery))
