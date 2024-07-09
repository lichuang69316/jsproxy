addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // 如果请求的协议是HTTP，重定向到HTTPS
  if (url.protocol === 'http:') {
    url.protocol = 'https:'
    return new Response('', {
      status: 301,
      headers: {
        'Location': url.href,
        'Strict-Transport-Security': 'max-age=99999999; includeSubDomains; preload',
      }
    })
  }

  // 移除代理前缀（假设你的Worker路径是/proxy/）
  const targetUrl = url.href.replace(url.origin + '/proxy/', '')

  // 创建新的请求对象，将原始请求的信息传递给目标服务器
  const proxyRequest = new Request(targetUrl, request)

  try {
    const response = await fetch(proxyRequest)

    // 克隆响应对象，以便可以修改响应头
    const modifiedResponse = new Response(response.body, response)

    // 设置跨域资源共享（CORS）头
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*')
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    modifiedResponse.headers.set('Access-Control-Allow-Headers', '*')

    return modifiedResponse
  } catch (err) {
    return new Response('Proxy error: ' + err.message, {
      status: 502,
      statusText: 'Bad Gateway'
    })
  }
}
