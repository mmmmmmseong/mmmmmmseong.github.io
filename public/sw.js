// 예전 사이트(Jekyll Chirpy 테마)가 등록한 서비스 워커를 없애기 위한 파일.
// 브라우저가 /sw.js 업데이트를 확인할 때 이 파일을 받으면,
// 저장해 둔 옛 페이지(캐시)를 모두 지우고 스스로 등록을 해제한 뒤 열린 탭을 새로고침한다.
// 이 사이트는 서비스 워커를 쓰지 않으므로, 예전 방문자가 충분히 정리된 뒤에는 지워도 된다.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) client.navigate(client.url);
    })(),
  );
});
