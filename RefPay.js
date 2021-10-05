const TeleBot = require('telebot')
const mongoose = require('mongoose')

const bot = new TeleBot({
    token: '1907224811:AAFdUZ0GiBUv_xCE1cSmuufzT0TS4jXUD64', // Debug
    polling: {
        interval: 100,
        timeout: 0,
        limit: 100,
        retryTimeout: 500,
     //   proxy: 'http://HohrVp:6H8BY2@81.4.108.157:35357'
    }
});

const MONGO_URL = "mongodb://dbu���er:kUvbj3mXs���3f@ds155325.mlab.com:1689/������";
mongoose.connect(MONGO_URL);

const UserSchema = { id: Number, name: String, username: String, ref: Number, ref_count: Number, balance: Number }
const User = mongoose.model('RefPay_users', UserSchema)

const a1 = 713883893
const a2 = 713883893

const start_text = "🚀 <b>Добро пожаловать на проект RefPay!</b>\n\n💵 Заработок предельно прост:\nВам необходимо <b>приглашать рефералов</b> в бот. За каждого приглашённого человека мы платим по <b>25 копеек</b>\n\n💰 Вывод от <b>25 рублей</b>\n\n❗️ Единственное правило:<b> накрутка запрещена!</b>\n\n💬 <b>Наш чат:</b> @\n\n👨‍💻 <b>Админ:</b> @\n\n"

var state = [0]

var qiwi_n = [0]

function roundPlus(x) {
    if (isNaN(x)) return false;
    var m = Math.pow(10, 2);
    return Math.round(x * m) / m;
}

function addBal(user_id, sum) { User.findOneAndUpdate({ id: user_id }, { $inc: { balance: sum } }).then((e) => { }) }
function addRef(user_id) { User.findOneAndUpdate({ id: user_id }, { $inc: { ref_count: 1 } }).then((e) => { }) }
async function getBal(user_id) { var user = await User.findOne({ id: user_id });console.log(user_id); return user.balance }

var mm_total;
var mm_i;
var mm_mchatid;
var mm_mmsgid;
var mm_status = false;
var mm_amsgid;


var timerId = setInterval(async function () {
    if (mm_status) {
        try {
            let isUser = await User.find({}).skip(mm_i).limit(1);
            await bot.forwardMessage(isUser[0].id, mm_mchatid, mm_mmsgid).then((err) => { console.log(err)}).catch((err) => { console.log(err)})
			console.log(isUser[0].id, mm_mchatid, mm_mmsgid)
            console.log(mm_i + ') ID' + isUser[0].id)
            isUser = undefined
            mm_i++;
            if (mm_i % 10 == 0) {
                var tek = Math.round((mm_i / mm_total) * 40)
                var str = ""
                for (var i = 0; i < tek; i++)
                    str += "+"
                str += '>'
                for (var i = tek+1; i < 41; i++)
                    str += "-"
                bot.editMessageText({ chatId: a1, messageId: mm_amsgid }, "Выполнено: " + mm_i + '/' + mm_total + ' - ' + Math.round((mm_i / mm_total) * 100) + '%\n' + str)
            }
            if (mm_i == mm_total) {
                mm_status = false;
                bot.editMessageText({ chatId: a1, messageId: mm_amsgid }, "Выполнено: " + mm_i + '/' + mm_total)
                bot.sendMessage(a1, 'Сообщение разослано ' + mm_i + ' пользователям!', { replyMarkup: RM_admin })
                bot.sendMessage(a2, 'Сообщение разослано ' + mm_i + ' пользователям!', { replyMarkup: RM_admin })
            }
        } finally { }
    }
}, 100);

async function mm(mchatid, mmsgid, amsgid) {
    mm_total = await User.count({})
    mm_i = 0;
    mm_mchatid = mchatid;
    mm_mmsgid = mmsgid;
    mm_status = true;
    mm_amsgid = amsgid;
}

const RM_default = bot.keyboard([
    [bot.button('🚀 Заработок')],
    [bot.button('💰 Баланс'), bot.button('📊 Cтатистика')],
    [bot.button('📢 Реклама'), bot.button('💬 Наш чат')]
], { resize: true });

const RM_admin = bot.inlineKeyboard([
    [bot.inlineButton('Рассылка', { callback: 'mm' })],
    [bot.inlineButton('Просмотр рефералов', { callback: 'refs' })],
]);

const RM_balance = bot.keyboard([
    [bot.button('💸 Вывести')],
    [bot.button('◀️ На главную')]], { resize: true });

const RM_back = bot.keyboard([[bot.button('◀️ На главную')]], { resize: true });

bot.on('text', async function (msg) {
    var uid = msg.from.id
    var utext = msg.text
    if (utext == "/start") {
        let isUser = await User.find({ id: uid })
        if (isUser.length == 0) {
            let user = new User({ id: uid, username: msg.from.username, name: msg.from.first_name, ref: 0, balance: 0, ref_count: 0 })
            await user.save()
        }
        bot.sendMessage(uid, start_text, { replyMarkup: RM_default, parseMode: 'html' });
    }
    else if (utext == "💰 Баланс") {
        bot.sendMessage(uid, '💰 На вашем балансе <b>' + roundPlus(await getBal(uid)) + ' </b>рублей!', { replyMarkup: RM_balance, parseMode: 'html' })
    }
    else if (utext == "🚀 Заработок")
        bot.sendMessage(uid, '🚀 <b>Заработок</b>\n\n🗣 Мы предлагаем Вам <b>зарабатывать</b> на привлечении рефералов!\n\n💸 Мы платим <b>25 копеек</b> за каждого реферала!\n\n👥 <b>Ваша реферальная ссылка:</b>\nhttp://t.me/slivmens?start=' + uid + '\n\n📢 Размещайте Вашу ссылку в каналах, каталогах, ботах, чатах и получайте <b>пассивный доход</b>!\n\n', { replyMarkup: RM_default, parseMode: 'html', webPreview: false });

    else if (utext == "/admin" && uid == a1 || utext == "/admin" && uid == a2)
        bot.sendMessage(uid, 'Добро пожаловать в админку!', { replyMarkup: RM_admin, parseMode: 'html', webPreview: false });


    else if (utext == "📊 Cтатистика") {
        var c = await User.count({})
        var rc = await User.count({ ref: uid })

        bot.sendMessage(uid, '📊 *Cтатистика проекта:*\n\n👥 Вы привлекли *' + rc + '* рефералов\n💵 Вы заработали *' + roundPlus(rc * 0.25) + '* рублей\n👨 Всего пользователей: *' + c + '*\n💰 Заработано всего: *' + roundPlus((483 + c * 0.3)) + ' рублей*', { replyMarkup: RM_default, parseMode: 'markdown', webPreview: false })
    }

    else if (utext == "💬 Наш чат")
        bot.sendMessage(uid, '️💬 <b>Приглашаем</b> Вас в наш <b>чат</b>: \n\nhttps://t.me/slivmens', { parseMode: 'html', webPreview: true });

    else if (utext == "📢 Реклама") {
        var c = await User.count({})
        bot.sendMessage(uid, '️💬 <b>Рассылка</b> на всех пользователей нашего бота стоит <b>' + 50 + '</b> рублей.\n\n🙂 По вопросам рекламы - @kredo_admin\n🙃 Для тех, у кого бан - @kredo_bot', { parseMode: 'html', webPreview: true });
    }

    else if (utext == "◀️ На главную") {
        bot.sendMessage(uid, 'Вы в главном меню', { replyMarkup: RM_default });
        balAdd_ctrl = 0
        balAdd_id = undefined
        mm_ctrl = false
        state[uid] = 0
    }
    else if (utext != "◀️ На главную" && state[uid] == 10) {
        var id = Number(msg.text)
      var user = await User.findOne({id: id})
      var refs = await User.find({ref: id}, {name: 1, username: 1, ref_count: 1}).limit(100)
      var str =  user.ref_count+" рефералов пользователя @"+user.username+':\n\n'
      for(var i=0; i<refs.length;i++)
          str += refs[i].name+" - @"+refs[i].username+' - '+refs[i].ref_count+' рефералов\n'
      bot.sendMessage(uid, str)
    }
    

    else if (utext == "💸 Вывести") {
        state[uid] = -1
        return bot.sendMessage(uid, '🐥 Введите номер Вашего *QIWI, Яндекс.Деньги, WebMoney или Payeer* кошелька:', { replyMarkup: RM_back, parseMode: 'markdown' });
    }
    else if (state[uid] == -1) {
        qiwi_n[uid] = utext
        var isUser = await User.find({ id: uid })
        var balance = Number(isUser[0].balance)
        bot.sendMessage(uid, '💰 На вашем балансе *' + balance + ' *рублей\n\nУкажите сумму для вывода:', { replyMarkup: RM_back, parseMode: 'markdown' })
        state[uid] = -2
    }
    else if (state[uid] == -2) {
        var qiwi_num = qiwi_n[uid]
        var isUser = await User.find({ id: uid })
        var balance = Number(isUser[0].balance)
        var wd_sum = utext
        if (wd_sum <= balance && isNaN(wd_sum) == false && wd_sum >= 25) {
            User.findOneAndUpdate({ 'id': uid }, { 'balance': balance - wd_sum }, { upsert: true }, function (err, doc) { })
            bot.sendMessage(a1, '📤*Новая заявка на вывод!*📤\n\nКошелёк: `' + qiwi_num + '`\nСумма: `' + wd_sum + '`\nID: `' + uid + '`', { replyMarkup: RM_back, parseMode: 'markdown' })
            bot.sendMessage(uid, 'Кошелёк: `' + qiwi_num + '`\nСумма: `' + wd_sum + '`\n\n💸Ваша выплата будет произведена в течение *24-х* часов!', { replyMarkup: RM_default, parseMode: 'markdown' })

        }
        else
            bot.sendMessage(uid, '❗️*Ошибка*❗️\n\nНедостаточно средств для вывода или сумма выплаты менее 25 рублей!\nУкажите другую сумму:', { replyMarkup: RM_back, parseMode: 'markdown' })
    }


})

bot.on(/^\/start (.+)$/, async function (msg, props) {
    var uid = msg.from.id
    const ref = Number(props.match[1]);
    var isUser = await User.find({ id: uid })

    if (isUser.length == 0) {
        bot.sendMessage(uid, start_text, { replyMarkup: RM_default, parseMode: 'markdown' });
        let user = new User({ id: uid, username: msg.from.username, name: msg.from.first_name, ref: ref, balance: 0, ref_count: 0 })
        user.save().then(() => {
            addBal(ref, 0.25)
            addRef(ref)
            bot.sendMessage(ref, "💸 Вам начислено <b>25 копеек</b> за регистрацию реферала!", { parseMode: "html" })
        })
    }
    bot.sendMessage(uid, start_text, { replyMarkup: RM_default, parseMode: 'html' });
});

bot.on('callbackQuery', async (msg) => {
    var d = msg.data
    var uid = msg.from.id
    if (uid == a1 || uid == a2) {
        if (d == "mm")
            bot.sendMessage(uid, "Перешлите сообщение для рассылки:")
            if (d == "refs")
            {
                bot.sendMessage(uid, "Введите ID пользователя для проверки:")
                state[uid]=10;
            }
        bot.answerCallbackQuery(msg.id, `Inline button callback: ${msg.data}`, true);
    }
});

bot.on("forward", async (msg, props) => {
    var uid = msg.from.id
    if (uid == a1 || uid == a2)
        bot.sendMessage(uid, "Рассылка запущена!").then((e) => {
            mm(msg.forward_from_chat.id, msg.forward_from_message_id, e.message_id)
			console.log(msg)
        })
});

bot.start()
