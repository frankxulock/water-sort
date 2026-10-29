/* 倒水排序文案。语言：Telegram 用户语言，其次浏览器，可在右上角改。 */
(function () {
  'use strict';

  var KEY = 'water-sort-lang';
  var OPTIONS = [
    { id: 'zh-CN', label: '简体中文' },
    { id: 'zh-TW', label: '繁體中文' },
    { id: 'en', label: 'English' },
    { id: 'ja', label: '日本語' },
    { id: 'ko', label: '한국어' },
    { id: 'ru', label: 'Русский' },
    { id: 'es', label: 'Español' },
    { id: 'pt', label: 'Português' },
    { id: 'vi', label: 'Tiếng Việt' },
    { id: 'id', label: 'Indonesia' },
    { id: 'th', label: 'ไทย' },
    { id: 'tr', label: 'Türkçe' }
  ];

  var STR = {
    'zh-CN': {
      title: '倒水排序', level: '第 {n} 关', moves: '步数',
      undo: '撤销', restart: '重开', hint: '提示', hintAd: '广告提示', addVial: '加瓶', skip: '跳关',
      tip: '点一瓶拿起，再点另一瓶倒入。同色才能叠，空瓶也可以。', rack: '水瓶', sep: '、', done: '，已完成',
      bottleEmpty: '第{n}瓶，空', bottle: '第{n}瓶，从底到顶 {colors}',
      pour: '把{color}色倒进第{n}瓶', pick: '拿起第{n}瓶', drop: '放下了', swap: '改拿第{n}瓶', blocked: '倒不进去',
      undone: '已撤销', levelIn: '第{n}关', extra: '多了一个空瓶，这一关都有效。', skipped: '跳过了，进入第 {n} 关。',
      noMove: '现在没有能倒的瓶子', tryPour: '试试把第{from}瓶倒进第{to}瓶',
      winSay: '过关了', winTitle: '过关了', winBody: '第 {n} 关完成，用了 {moves} 步。', next: '下一关', replay: '再玩本关',
      stuckSay: '这一步走不通', stuckTitle: '倒不开了',
      stuckAd: '看一段广告多一个空瓶，或者撤销几步。', stuckAdBtn: '看广告加空瓶',
      stuckRestart: '这一关需要重开。', stuckUndo: '撤销几步，或者重开这一关。',
      adSkip: '没看完，这次没有奖励。', adFail: '广告没播成，这次没有奖励。',
      c_red: '红', c_orange: '橙', c_yellow: '黄', c_green: '绿', c_cyan: '青', c_blue: '蓝', c_purple: '紫', c_pink: '粉'
    },
    'zh-TW': {
      title: '倒水排序', level: '第 {n} 關', moves: '步數',
      undo: '撤銷', restart: '重開', hint: '提示', hintAd: '廣告提示', addVial: '加瓶', skip: '跳關',
      tip: '點一瓶拿起，再點另一瓶倒入。同色才能疊，空瓶也可以。', rack: '水瓶', sep: '、', done: '，已完成',
      bottleEmpty: '第{n}瓶，空', bottle: '第{n}瓶，從底到頂 {colors}',
      pour: '把{color}色倒進第{n}瓶', pick: '拿起第{n}瓶', drop: '放下了', swap: '改拿第{n}瓶', blocked: '倒不進去',
      undone: '已撤銷', levelIn: '第{n}關', extra: '多了一個空瓶，這一關都有效。', skipped: '跳過了，進入第 {n} 關。',
      noMove: '現在沒有能倒的瓶子', tryPour: '試試把第{from}瓶倒進第{to}瓶',
      winSay: '過關了', winTitle: '過關了', winBody: '第 {n} 關完成，用了 {moves} 步。', next: '下一關', replay: '再玩本關',
      stuckSay: '這一步走不通', stuckTitle: '倒不開了',
      stuckAd: '看一段廣告多一個空瓶，或是撤銷幾步。', stuckAdBtn: '看廣告加空瓶',
      stuckRestart: '這一關需要重開。', stuckUndo: '撤銷幾步，或是重開這一關。',
      adSkip: '沒看完，這次沒有獎勵。', adFail: '廣告沒播成，這次沒有獎勵。',
      c_red: '紅', c_orange: '橙', c_yellow: '黃', c_green: '綠', c_cyan: '青', c_blue: '藍', c_purple: '紫', c_pink: '粉'
    },
    en: {
      title: 'Water Sort', level: 'Level {n}', moves: 'Moves',
      undo: 'Undo', restart: 'Restart', hint: 'Hint', hintAd: 'Ad hint', addVial: '+Tube', skip: 'Skip',
      tip: 'Tap a tube, then another. Only matching colors stack. Empty tubes are fine.', rack: 'Tubes', sep: ', ', done: ', done',
      bottleEmpty: 'Tube {n}, empty', bottle: 'Tube {n}, bottom to top {colors}',
      pour: 'Pour {color} into tube {n}', pick: 'Picked up tube {n}', drop: 'Put it down', swap: 'Switched to tube {n}', blocked: 'Cannot pour there',
      undone: 'Undone', levelIn: 'Level {n}', extra: 'An empty tube was added for this level.', skipped: 'Skipped. Now on level {n}.',
      noMove: 'No pour is possible', tryPour: 'Try pouring tube {from} into tube {to}',
      winSay: 'Cleared', winTitle: 'Cleared', winBody: 'Level {n} cleared in {moves} moves.', next: 'Next', replay: 'Replay',
      stuckSay: 'No moves left', stuckTitle: 'Stuck',
      stuckAd: 'Watch an ad for an empty tube, or undo a few moves.', stuckAdBtn: 'Ad for a tube',
      stuckRestart: 'This level needs a restart.', stuckUndo: 'Undo a few moves, or restart this level.',
      adSkip: 'The ad was not finished, so there is no reward.', adFail: 'The ad did not play, so there is no reward.',
      c_red: 'red', c_orange: 'orange', c_yellow: 'yellow', c_green: 'green', c_cyan: 'cyan', c_blue: 'blue', c_purple: 'purple', c_pink: 'pink'
    },
    ja: {
      title: 'ウォーターソート', level: 'レベル {n}', moves: '手数',
      undo: '戻す', restart: 'やり直す', hint: 'ヒント', hintAd: '広告ヒント', addVial: '瓶追加', skip: 'スキップ',
      tip: '瓶をタップして、もう一つの瓶へ。同じ色だけ重なります。空瓶も使えます。', rack: '瓶', sep: '、', done: '、完成',
      bottleEmpty: '{n}本目、空', bottle: '{n}本目、下から {colors}',
      pour: '{color}を{n}本目に注ぐ', pick: '{n}本目を持った', drop: '置いた', swap: '{n}本目に持ち替えた', blocked: '注げません',
      undone: '戻しました', levelIn: 'レベル{n}', extra: '空の瓶を追加しました。このレベルで使えます。', skipped: 'スキップしてレベル {n} へ。',
      noMove: '注げる瓶がありません', tryPour: '{from}本目を{to}本目に注いでみて',
      winSay: 'クリア', winTitle: 'クリア', winBody: 'レベル {n} を {moves} 手でクリア。', next: '次へ', replay: 'もう一度',
      stuckSay: '手がない', stuckTitle: '行き詰まり',
      stuckAd: '広告を見ると空瓶が増えます。手を戻すこともできます。', stuckAdBtn: '広告で瓶追加',
      stuckRestart: 'このレベルはやり直しが必要です。', stuckUndo: '数手戻すか、このレベルをやり直してください。',
      adSkip: '最後まで見なかったので、報酬はありません。', adFail: '広告が再生できなかったので、報酬はありません。',
      c_red: '赤', c_orange: 'オレンジ', c_yellow: '黄', c_green: '緑', c_cyan: '水色', c_blue: '青', c_purple: '紫', c_pink: 'ピンク'
    },
    ko: {
      title: '물정렬', level: '{n}단계', moves: '횟수',
      undo: '취소', restart: '다시', hint: '힌트', hintAd: '광고 힌트', addVial: '병 추가', skip: '건너뛰기',
      tip: '병을 고른 뒤 다른 병에 따르세요. 같은 색만 쌓이고, 빈 병도 됩니다.', rack: '물병', sep: ', ', done: ', 완료',
      bottleEmpty: '{n}번 병, 비어 있음', bottle: '{n}번 병, 아래부터 {colors}',
      pour: '{color}을 {n}번 병에 따르기', pick: '{n}번 병을 집음', drop: '내려놓음', swap: '{n}번 병으로 바꿈', blocked: '따를 수 없음',
      undone: '취소함', levelIn: '{n}단계', extra: '빈 병이 추가되었습니다. 이 단계에서 유지됩니다.', skipped: '건너뛰어 {n}단계로 이동합니다.',
      noMove: '따를 수 있는 병이 없습니다', tryPour: '{from}번 병을 {to}번 병에 따라 보세요',
      winSay: '클리어', winTitle: '클리어', winBody: '{n}단계를 {moves}번 만에 클리어했습니다.', next: '다음', replay: '다시 하기',
      stuckSay: '더 둘 수 없음', stuckTitle: '막힘',
      stuckAd: '광고를 보면 빈 병이 생깁니다. 몇 수 되돌릴 수도 있습니다.', stuckAdBtn: '광고로 병 추가',
      stuckRestart: '이 단계는 다시 시작해야 합니다.', stuckUndo: '몇 수 되돌리거나 이 단계를 다시 시작하세요.',
      adSkip: '광고를 끝까지 보지 않아 보상이 없습니다.', adFail: '광고가 재생되지 않아 보상이 없습니다.',
      c_red: '빨강', c_orange: '주황', c_yellow: '노랑', c_green: '초록', c_cyan: '청록', c_blue: '파랑', c_purple: '보라', c_pink: '분홍'
    },
    ru: {
      title: 'Сортировка воды', level: 'Уровень {n}', moves: 'Ходы',
      undo: 'Отмена', restart: 'Заново', hint: 'Подсказка', hintAd: 'За рекламу', addVial: '+Колба', skip: 'Пропуск',
      tip: 'Нажмите колбу, затем другую. Сливать можно только одинаковый цвет. Пустые тоже можно.', rack: 'Колбы', sep: ', ', done: ', готово',
      bottleEmpty: 'Колба {n}, пусто', bottle: 'Колба {n}, снизу вверх {colors}',
      pour: 'Перелить {color} в колбу {n}', pick: 'Взята колба {n}', drop: 'Отпущено', swap: 'Теперь колба {n}', blocked: 'Сюда нельзя перелить',
      undone: 'Ход отменён', levelIn: 'Уровень {n}', extra: 'Добавлена пустая колба на этот уровень.', skipped: 'Пропуск. Теперь уровень {n}.',
      noMove: 'Нет возможных ходов', tryPour: 'Попробуйте перелить колбу {from} в колбу {to}',
      winSay: 'Пройдено', winTitle: 'Пройдено', winBody: 'Уровень {n} пройден за {moves} ходов.', next: 'Дальше', replay: 'Ещё раз',
      stuckSay: 'Ходов нет', stuckTitle: 'Тупик',
      stuckAd: 'Посмотрите рекламу, чтобы получить пустую колбу, или отмените ходы.', stuckAdBtn: 'Реклама: колба',
      stuckRestart: 'Этот уровень нужно начать заново.', stuckUndo: 'Отмените несколько ходов или начните уровень заново.',
      adSkip: 'Реклама не досмотрена, награды нет.', adFail: 'Реклама не запустилась, награды нет.',
      c_red: 'красный', c_orange: 'оранжевый', c_yellow: 'жёлтый', c_green: 'зелёный', c_cyan: 'бирюзовый', c_blue: 'синий', c_purple: 'фиолетовый', c_pink: 'розовый'
    },
    es: {
      title: 'Ordenar agua', level: 'Nivel {n}', moves: 'Movimientos',
      undo: 'Deshacer', restart: 'Reiniciar', hint: 'Pista', hintAd: 'Pista anuncio', addVial: '+Tubo', skip: 'Saltar',
      tip: 'Toca un tubo y luego otro. Solo se apila el mismo color. Los vacíos valen.', rack: 'Tubos', sep: ', ', done: ', listo',
      bottleEmpty: 'Tubo {n}, vacío', bottle: 'Tubo {n}, de abajo arriba {colors}',
      pour: 'Verter {color} en el tubo {n}', pick: 'Tubo {n} cogido', drop: 'Soltado', swap: 'Ahora el tubo {n}', blocked: 'No se puede verter',
      undone: 'Deshecho', levelIn: 'Nivel {n}', extra: 'Se añadió un tubo vacío para este nivel.', skipped: 'Saltado. Ahora el nivel {n}.',
      noMove: 'No hay vertidos posibles', tryPour: 'Prueba a verter el tubo {from} en el {to}',
      winSay: 'Completado', winTitle: 'Completado', winBody: 'Nivel {n} completado en {moves} movimientos.', next: 'Siguiente', replay: 'Repetir',
      stuckSay: 'Sin movimientos', stuckTitle: 'Atascado',
      stuckAd: 'Mira un anuncio para un tubo vacío, o deshaz unos movimientos.', stuckAdBtn: 'Anuncio: tubo',
      stuckRestart: 'Hay que reiniciar este nivel.', stuckUndo: 'Deshaz unos movimientos o reinicia el nivel.',
      adSkip: 'No terminaste el anuncio, no hay premio.', adFail: 'El anuncio no se reprodujo, no hay premio.',
      c_red: 'rojo', c_orange: 'naranja', c_yellow: 'amarillo', c_green: 'verde', c_cyan: 'cian', c_blue: 'azul', c_purple: 'morado', c_pink: 'rosa'
    },
    pt: {
      title: 'Ordenar água', level: 'Nível {n}', moves: 'Jogadas',
      undo: 'Desfazer', restart: 'Recomeçar', hint: 'Dica', hintAd: 'Dica anúncio', addVial: '+Tubo', skip: 'Pular',
      tip: 'Toque num tubo e depois noutro. Só a mesma cor empilha. Tubos vazios servem.', rack: 'Tubos', sep: ', ', done: ', pronto',
      bottleEmpty: 'Tubo {n}, vazio', bottle: 'Tubo {n}, de baixo para cima {colors}',
      pour: 'Despejar {color} no tubo {n}', pick: 'Tubo {n} na mão', drop: 'Largado', swap: 'Agora o tubo {n}', blocked: 'Não dá para despejar',
      undone: 'Desfeito', levelIn: 'Nível {n}', extra: 'Um tubo vazio foi adicionado neste nível.', skipped: 'Pulado. Agora o nível {n}.',
      noMove: 'Não há jogada possível', tryPour: 'Tente despejar o tubo {from} no tubo {to}',
      winSay: 'Concluído', winTitle: 'Concluído', winBody: 'Nível {n} concluído em {moves} jogadas.', next: 'Próximo', replay: 'Repetir',
      stuckSay: 'Sem jogadas', stuckTitle: 'Travado',
      stuckAd: 'Veja um anúncio para ganhar um tubo vazio, ou desfaça algumas jogadas.', stuckAdBtn: 'Anúncio: tubo',
      stuckRestart: 'Este nível precisa recomeçar.', stuckUndo: 'Desfaça algumas jogadas ou recomece o nível.',
      adSkip: 'O anúncio não foi concluído, sem recompensa.', adFail: 'O anúncio não tocou, sem recompensa.',
      c_red: 'vermelho', c_orange: 'laranja', c_yellow: 'amarelo', c_green: 'verde', c_cyan: 'ciano', c_blue: 'azul', c_purple: 'roxo', c_pink: 'rosa'
    },
    vi: {
      title: 'Xếp nước', level: 'Màn {n}', moves: 'Lượt',
      undo: 'Hoàn tác', restart: 'Chơi lại', hint: 'Gợi ý', hintAd: 'Gợi ý QC', addVial: '+Ống', skip: 'Bỏ qua',
      tip: 'Chạm một ống, rồi ống khác. Chỉ màu giống mới xếp được. Ống trống cũng được.', rack: 'Ống nước', sep: ', ', done: ', xong',
      bottleEmpty: 'Ống {n}, trống', bottle: 'Ống {n}, từ dưới lên {colors}',
      pour: 'Đổ {color} vào ống {n}', pick: 'Đã cầm ống {n}', drop: 'Đã đặt xuống', swap: 'Đổi sang ống {n}', blocked: 'Không đổ được',
      undone: 'Đã hoàn tác', levelIn: 'Màn {n}', extra: 'Đã thêm một ống trống cho màn này.', skipped: 'Đã bỏ qua. Vào màn {n}.',
      noMove: 'Không còn nước nào đổ được', tryPour: 'Thử đổ ống {from} vào ống {to}',
      winSay: 'Qua màn', winTitle: 'Qua màn', winBody: 'Màn {n} xong trong {moves} lượt.', next: 'Màn sau', replay: 'Chơi lại',
      stuckSay: 'Hết nước đi', stuckTitle: 'Bí',
      stuckAd: 'Xem quảng cáo để thêm ống trống, hoặc hoàn tác vài lượt.', stuckAdBtn: 'QC thêm ống',
      stuckRestart: 'Màn này cần chơi lại.', stuckUndo: 'Hoàn tác vài lượt, hoặc chơi lại màn này.',
      adSkip: 'Chưa xem hết quảng cáo, không có thưởng.', adFail: 'Quảng cáo không phát được, không có thưởng.',
      c_red: 'đỏ', c_orange: 'cam', c_yellow: 'vàng', c_green: 'lục', c_cyan: 'lam', c_blue: 'xanh', c_purple: 'tím', c_pink: 'hồng'
    },
    id: {
      title: 'Sortir Air', level: 'Level {n}', moves: 'Langkah',
      undo: 'Urung', restart: 'Ulang', hint: 'Petunjuk', hintAd: 'Iklan', addVial: '+Tabung', skip: 'Lewati',
      tip: 'Ketuk satu tabung, lalu tabung lain. Hanya warna sama yang bisa ditumpuk. Tabung kosong boleh.', rack: 'Tabung', sep: ', ', done: ', selesai',
      bottleEmpty: 'Tabung {n}, kosong', bottle: 'Tabung {n}, dari bawah {colors}',
      pour: 'Tuangkan {color} ke tabung {n}', pick: 'Mengambil tabung {n}', drop: 'Diletakkan', swap: 'Beralih ke tabung {n}', blocked: 'Tidak bisa dituang',
      undone: 'Dibatalkan', levelIn: 'Level {n}', extra: 'Satu tabung kosong ditambahkan untuk level ini.', skipped: 'Dilewati. Sekarang level {n}.',
      noMove: 'Tidak ada tuangan yang mungkin', tryPour: 'Coba tuang tabung {from} ke tabung {to}',
      winSay: 'Selesai', winTitle: 'Selesai', winBody: 'Level {n} selesai dalam {moves} langkah.', next: 'Berikutnya', replay: 'Main lagi',
      stuckSay: 'Tidak ada langkah', stuckTitle: 'Buntu',
      stuckAd: 'Tonton iklan untuk tabung kosong, atau batalkan beberapa langkah.', stuckAdBtn: 'Iklan: tabung',
      stuckRestart: 'Level ini perlu diulang.', stuckUndo: 'Batalkan beberapa langkah, atau ulangi level ini.',
      adSkip: 'Iklan tidak selesai, tidak ada hadiah.', adFail: 'Iklan tidak diputar, tidak ada hadiah.',
      c_red: 'merah', c_orange: 'oranye', c_yellow: 'kuning', c_green: 'hijau', c_cyan: 'sian', c_blue: 'biru', c_purple: 'ungu', c_pink: 'merah muda'
    },
    th: {
      title: 'เรียงน้ำ', level: 'ด่าน {n}', moves: 'จำนวนครั้ง',
      undo: 'ย้อน', restart: 'เริ่มใหม่', hint: 'คำใบ้', hintAd: 'ดูโฆษณา', addVial: '+หลอด', skip: 'ข้าม',
      tip: 'แตะหลอด แล้วแตะอีกหลอด สีเดียวกันเท่านั้นที่ซ้อนได้ หลอดว่างก็ใช้ได้', rack: 'หลอดน้ำ', sep: ', ', done: ', เสร็จ',
      bottleEmpty: 'หลอด {n} ว่าง', bottle: 'หลอด {n} จากล่างขึ้นบน {colors}',
      pour: 'เท{color}ลงหลอด {n}', pick: 'หยิบหลอด {n}', drop: 'วางแล้ว', swap: 'เปลี่ยนเป็นหลอด {n}', blocked: 'เทไม่ได้',
      undone: 'ย้อนแล้ว', levelIn: 'ด่าน {n}', extra: 'เพิ่มหลอดว่างให้ด่านนี้แล้ว', skipped: 'ข้ามแล้ว เข้าด่าน {n}',
      noMove: 'ไม่มีหลอดที่เทได้', tryPour: 'ลองเทหลอด {from} ลงหลอด {to}',
      winSay: 'ผ่านด่าน', winTitle: 'ผ่านด่าน', winBody: 'ผ่านด่าน {n} ใน {moves} ครั้ง', next: 'ด่านถัดไป', replay: 'เล่นอีก',
      stuckSay: 'ไปต่อไม่ได้', stuckTitle: 'ตัน',
      stuckAd: 'ดูโฆษณาเพื่อได้หลอดว่าง หรือย้อนสักสองสามครั้ง', stuckAdBtn: 'ดูโฆษณาได้หลอด',
      stuckRestart: 'ด่านนี้ต้องเริ่มใหม่', stuckUndo: 'ย้อนสักสองสามครั้ง หรือเริ่มด่านนี้ใหม่',
      adSkip: 'ดูโฆษณาไม่จบ จึงไม่มีรางวัล', adFail: 'โฆษณาเล่นไม่ได้ จึงไม่มีรางวัล',
      c_red: 'แดง', c_orange: 'ส้ม', c_yellow: 'เหลือง', c_green: 'เขียว', c_cyan: 'ฟ้า', c_blue: 'น้ำเงิน', c_purple: 'ม่วง', c_pink: 'ชมพู'
    },
    tr: {
      title: 'Su Sıralama', level: 'Seviye {n}', moves: 'Hamle',
      undo: 'Geri al', restart: 'Yeniden', hint: 'İpucu', hintAd: 'Reklam ipucu', addVial: '+Tüp', skip: 'Atla',
      tip: 'Bir tüpe, sonra diğerine dokun. Yalnızca aynı renk üst üste gelir. Boş tüp de olur.', rack: 'Tüpler', sep: ', ', done: ', bitti',
      bottleEmpty: 'Tüp {n}, boş', bottle: 'Tüp {n}, alttan üste {colors}',
      pour: '{color} rengini {n}. tüpe dök', pick: '{n}. tüp alındı', drop: 'Bırakıldı', swap: '{n}. tüpe geçildi', blocked: 'Oraya dökülemez',
      undone: 'Geri alındı', levelIn: 'Seviye {n}', extra: 'Bu seviye için boş bir tüp eklendi.', skipped: 'Atlandı. Şimdi seviye {n}.',
      noMove: 'Dökülebilecek tüp yok', tryPour: '{from}. tüpü {to}. tüpe dökmeyi dene',
      winSay: 'Bitti', winTitle: 'Bitti', winBody: 'Seviye {n}, {moves} hamlede bitti.', next: 'Sonraki', replay: 'Tekrar',
      stuckSay: 'Hamle kalmadı', stuckTitle: 'Tıkandı',
      stuckAd: 'Boş tüp için reklam izle veya birkaç hamle geri al.', stuckAdBtn: 'Reklam: tüp',
      stuckRestart: 'Bu seviye yeniden başlamalı.', stuckUndo: 'Birkaç hamle geri al veya seviyeyi yeniden başlat.',
      adSkip: 'Reklam bitmedi, ödül yok.', adFail: 'Reklam oynatılmadı, ödül yok.',
      c_red: 'kırmızı', c_orange: 'turuncu', c_yellow: 'sarı', c_green: 'yeşil', c_cyan: 'camgöbeği', c_blue: 'mavi', c_purple: 'mor', c_pink: 'pembe'
    }
  };

  function known(id) {
    for (var i = 0; i < OPTIONS.length; i++) if (OPTIONS[i].id === id) return true;
    return false;
  }

  function normalize(code) {
    var text = String(code || '').toLowerCase().replace('_', '-');
    if (!text) return '';
    if (text.indexOf('zh') === 0) {
      if (text.indexOf('tw') >= 0 || text.indexOf('hk') >= 0 || text.indexOf('mo') >= 0 || text.indexOf('hant') >= 0) return 'zh-TW';
      return 'zh-CN';
    }
    var base = text.split('-')[0];
    if (base === 'pt') return 'pt';
    return known(base) ? base : '';
  }

  function saved() {
    try { return normalize(localStorage.getItem(KEY)); } catch (e) { return ''; }
  }

  function telegramCode() {
    var tg = window.Telegram && window.Telegram.WebApp;
    var user = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
    return user && user.language_code;
  }

  var lang = saved() || normalize(telegramCode()) || normalize(navigator.language) || 'en';

  function t(key, vars) {
    var pack = STR[lang] || STR.en;
    var text = pack[key];
    if (text == null) text = STR.en[key];
    if (text == null) text = key;
    if (!vars) return text;
    return text.replace(/\{(\w+)\}/g, function (_, name) {
      return vars[name] == null ? '' : String(vars[name]);
    });
  }

  function set(code) {
    var next = normalize(code);
    if (!next) return lang;
    lang = next;
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    return lang;
  }

  window.WaterI18n = {
    code: function () { return lang; },
    t: t,
    set: set,
    options: OPTIONS
  };
})();
