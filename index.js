const { Client, Collection, GatewayIntentBits, EmbedBuilder, ModalBuilder,MessageActionRow ,TextInputBuilder, TextInputStyle ,ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageAttachment,InteractionType  } = require('discord.js');

let TicketChannelID = null;

let kayıtcounter = 0;
let onericounter = 0;
let sikayetcounter = 0;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = '<';

const fs = require('fs');
const { name } = require('./commands/ping');


require('dotenv').config();

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require('./commands/' + file);
  client.commands.set(command.name, command);
}

client.on('ready', () => console.log("Bot is now online Hurray ! ."));


client.on("guildCreate", guild => {
  console.log("Joined a new guild: " + guild.name);

  guild.channels.create({
    name: 'Bilet-Günlüğü',
    type: ChannelType.GuildCategory,
  }).then(category => {
    guild.channels.create({ name: "Bilet-Dosyaları" }, { type: ChannelType.GuildText }).then(created_channel => { created_channel.setParent(category.id) })
    guild.channels.create({ name: "Bilet-Rapor" }, { type: ChannelType.GuildText }).then(created_channel => { created_channel.setParent(category.id) })
  })
  guild.channels.create({ name: "Bilet" }, { type: "GUILD_TEXT" })
    .then(channel => {
      TicketChannelID = channel.id;
      console.log(TicketChannelID);

      let exampleEmbed = new EmbedBuilder()
        .setColor(0x202225)
        .setTitle('Mutlaka okuyunuz!')
        .setDescription(`**A- Size uygun bilet türünü seçin ve açılan kanaldaki tüm bilgilendirmeyi okuyun.

B- Tüm açılan biletler kayıt edilmektedir ve bu süreçteki içerikleri sadece siz ve Yetkililer görebilirler.

C- Moderatör permi etiketlemek,Özel olarak bir yetkiliyi etiketlemek (örn; <@404012783655714818> ) yasaktır.


Bilet açıp, boş bırakmak, yasaktır.
Zaman aşımı almanıza neden olur. **`)
        .setImage('https://i.imgur.com/qxJ4H72.gif');

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('primary')
            .setLabel('Kayıt Bileti')
            .setStyle(ButtonStyle.Primary),
        ).addComponents(
          new ButtonBuilder()
            .setCustomId('primary2')
            .setLabel('Öneri Bileti')
            .setStyle(ButtonStyle.Success),
        ).addComponents(
          new ButtonBuilder()
            .setCustomId('primary3')
            .setLabel('Şikayet Bileti')
            .setStyle(ButtonStyle.Danger),
        );

      let message = channel.send({ embeds: [exampleEmbed], components: [row] });
    }).catch(console.error);
});



client.on("messageCreate", message => {


  if (message.mentions.has("225878079422201856")) {
    if (message.member.roles.cache.some(role => role.name === 'Yetkili'))
      return;
    else if (message.member.roles.cache.some(role => role.name === 'Moderatör'))
      return;
    else {
      message.member.timeout(60 * 60 * 1000, 'Barışı etiketlemekten 1 saat timeout')
      let exampleEmbed = new EmbedBuilder()
        .setColor(0x202225)
        .setTitle('Barış Zorbayı Etiketlemek Yasaktır!')
        .setDescription(` <@${message.author.id}> Lütfen Kurallar Kanalına Göz atınız
1 saat sonra görüşmek üzere...`)
        .setImage('https://i.imgur.com/qxJ4H72.gif');
      message.author.send({ embeds: [exampleEmbed] })
    }
  }

  //Moderatörlerimizi etikletlemek yasaktır alanı.
  if ((message.mentions.has("667094045545201693") || message.mentions.has("724377969006739456") || message.mentions.has("225878079422201856")) && (message.channel.name.includes("kayıt"))) {
    let exampleEmbed = new EmbedBuilder()
      .setColor(0x202225)
      .setTitle('Moderatör etiketlemek yasaktır!')
      .setDescription(` <@${message.author.id}> Lütfen <#1002988417275138140> Kanalına Göz atınız`)
      .setImage('https://i.imgur.com/qxJ4H72.gif');
    message.channel.send({ embeds: [exampleEmbed] }).then(message => setTimeout(() => message.delete(), 5000))

    message.delete()
  }

})

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  let commandname = interaction.customId;
  if (commandname === 'primary') {
    await interaction.deferUpdate();
    const guild = await client.guilds.fetch(interaction.guildId);
    await guild.channels.create({ name: "Kayıt-" + String(kayıtcounter) }, { topic: "Kayıt", type: "GUILD_TEXT" }).then(channel => {
      channel.permissionOverwrites.edit(guild.id, { ViewChannel: false });
      kayıtcounter += 1;
      channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true });
      let role = guild.roles.cache.find(role => role.name === "Yetkili");
      channel.permissionOverwrites.edit(role.id, { ViewChannel: true });

      let exampleEmbed = new EmbedBuilder()
        .setColor(0x202225)
        .setTitle('Hangi başvuru için bilet oluşturduğunuzu yazarak başlayın;')
        .setDescription('Biletinizi açıklayıcı yazınız, varsa tüm sorulara cevap vermiş olduğunuzdan emin olun.')
        .setImage('https://i.imgur.com/qxJ4H72.gif');
      const rowAdmin = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('inceleniyor')
            .setEmoji('🟡')
            .setLabel('İnceleniyor')
            .setStyle(ButtonStyle.Primary),
        )
        .addComponents(
          new ButtonBuilder()
            .setCustomId('kaydetvekapa')
            .setEmoji('🟢')
            .setLabel('Çözüldü')
            .setStyle(ButtonStyle.Primary),
        );

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('lock')
            .setEmoji('🔒')
            .setLabel('Bileti Kapat')
            .setStyle(ButtonStyle.Secondary),
        );

      let message = channel.send({ embeds: [exampleEmbed], components: [rowAdmin, row] });
    });

  } else if (commandname === 'primary2') {
    if (!interaction.member.roles.cache.some(role => role.id === '1003252867584512030') ) {
      let exampleEmbed = new EmbedBuilder()
        .setColor(0x202225)
        .setTitle('HATA!')
        .setDescription('Kayıt olup Aşkolar Rolünü almadan Öneri bileti oluşturamazsınız!')
        .setImage('https://i.imgur.com/qxJ4H72.gif');
      interaction.reply({ embeds: [exampleEmbed], ephemeral: true })

    } else {
      const guild = await client.guilds.fetch(interaction.guildId);
      await guild.channels.create({ name: "Öneri-" + String(onericounter) }, { topic: "Öneri", type: "GUILD_TEXT" }).then(channel => {
        channel.permissionOverwrites.edit(guild.id, { ViewChannel: false });
        onericounter += 1;
        channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true });
        let role = guild.roles.cache.find(role => role.name === "Yetkili");
        channel.permissionOverwrites.edit(role.id, { ViewChannel: true });


        let exampleEmbed = new EmbedBuilder()
          .setColor(0x202225)
          .setTitle('Konuyu belirterek başlayın')
          .setDescription(`Örn: ( Yeni oyun perm'i , Yeni bot talebi vs. ) 

      En kısa sürede sizinle iletişime geçeceğiz. Tüm önerileriniz dikkate alındığını unutmayın!`)
          .setImage('https://i.imgur.com/qxJ4H72.gif');
        const rowAdmin = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('inceleniyor')
              .setEmoji('🟡')
              .setLabel('İnceleniyor')
              .setStyle(ButtonStyle.Primary),
          )
          .addComponents(
            new ButtonBuilder()
              .setCustomId('kaydetvekapa')
              .setEmoji('🟢')
              .setLabel('Çözüldü')
              .setStyle(ButtonStyle.Primary),
          );

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('lock')
              .setEmoji('🔒')
              .setLabel('Bileti Kapat')
              .setStyle(ButtonStyle.Secondary),
          );

        let message = channel.send({ embeds: [exampleEmbed], components: [rowAdmin, row] });

      });
      await interaction.deferUpdate();
    }
  } else if (commandname === 'primary3') {
    if (!interaction.member.roles.cache.some(role => role.id === '1003252867584512030')) {
      let exampleEmbed = new EmbedBuilder()
        .setColor(0x202225)
        .setTitle('HATA!')
        .setDescription('Kayıt olup Aşkolar Rolünü almadan Şikayet Bileti oluşturamazsınız!')
        .setImage('https://i.imgur.com/qxJ4H72.gif');
      interaction.reply({ embeds: [exampleEmbed], ephemeral: true })

    } else {
      const guild = await client.guilds.fetch(interaction.guildId);
      await guild.channels.create({ name: "Şikayet-" + String(sikayetcounter) }, { topic: "Şikayet", type: "GUILD_TEXT" }).then(channel => {
        channel.permissionOverwrites.edit(guild.id, { ViewChannel: false });
        sikayetcounter += 1;
        channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true });
        let role = guild.roles.cache.find(role => role.name === "Yetkili");
        channel.permissionOverwrites.edit(role.id, { ViewChannel: true });


        let exampleEmbed = new EmbedBuilder()
          .setColor(0x202225)
          .setDescription('Bir kural ihlaliyle karşılaştıysanız, bir kullanıcı tarafından reklam alıyor ya da rahatsız ediliyorsanız, durumu SS alarak bizlerle paylaşabilirsiniz')
          .setImage('https://i.imgur.com/qxJ4H72.gif');

        const rowAdmin = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('inceleniyor')
              .setEmoji('🟡')
              .setLabel('İnceleniyor')
              .setStyle(ButtonStyle.Primary),
          )
          .addComponents(
            new ButtonBuilder()
              .setCustomId('kaydetvekapa')
              .setEmoji('🟢')
              .setLabel('Çözüldü')
              .setStyle(ButtonStyle.Primary),
          );

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('lock')
              .setEmoji('🔒')
              .setLabel('Bileti Kapat')
              .setStyle(ButtonStyle.Secondary),
          );

        let message = channel.send({ embeds: [exampleEmbed], components: [rowAdmin, row] });

      });
      await interaction.deferUpdate();
    }
  }else if (commandname === 'inceleniyor'){
    if (!interaction.member.roles.cache.some(role => role.name === 'Yetkili')){
    await interaction.deferUpdate();
    const channel = await client.channels.fetch(interaction.channelId);
    console.log(channel.name)
    if (channel.name.startsWith("kayıt")){const { Client, Collection, GatewayIntentBits, EmbedBuilder, ModalBuilder,MessageActionRow ,TextInputBuilder, TextInputStyle ,ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, MessageAttachment,InteractionType  } = require('discord.js');

    let TicketChannelID = null;
    
    let kayıtcounter = 0;
    let onericounter = 0;
    let sikayetcounter = 0;
    
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });
    
    const prefix = '<';
    
    const fs = require('fs');
    const { name } = require('./commands/ping');
    
    
    require('dotenv').config();
    
    client.commands = new Collection();
    
    const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const command = require('./commands/' + file);
      client.commands.set(command.name, command);
    }
    
    client.on('ready', () => console.log("Bot is now online Hurray ! ."));
    
    
    client.on("guildCreate", guild => {
      console.log("Joined a new guild: " + guild.name);
    
      guild.channels.create({
        name: 'Bilet-Günlüğü',
        type: ChannelType.GuildCategory,
      }).then(category => {
        guild.channels.create({ name: "Bilet-Dosyaları" }, { type: ChannelType.GuildText }).then(created_channel => { created_channel.setParent(category.id) })
        guild.channels.create({ name: "Bilet-Rapor" }, { type: ChannelType.GuildText }).then(created_channel => { created_channel.setParent(category.id) })
      })
      guild.channels.create({ name: "Bilet" }, { type: "GUILD_TEXT" })
        .then(channel => {
          TicketChannelID = channel.id;
          console.log(TicketChannelID);
    
          let exampleEmbed = new EmbedBuilder()
            .setColor(0x202225)
            .setTitle('Mutlaka okuyunuz!')
            .setDescription(`**A- Size uygun bilet türünü seçin ve açılan kanaldaki tüm bilgilendirmeyi okuyun.
    
    B- Tüm açılan biletler kayıt edilmektedir ve bu süreçteki içerikleri sadece siz ve Yetkililer görebilirler.
    
    C- Moderatör permi etiketlemek,Özel olarak bir yetkiliyi etiketlemek (örn; <@404012783655714818> ) yasaktır.
    
    
    Bilet açıp, boş bırakmak, yasaktır.
    Zaman aşımı almanıza neden olur. **`)
            .setImage('https://i.imgur.com/qxJ4H72.gif');
    
          const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('primary')
                .setLabel('Kayıt Bileti')
                .setStyle(ButtonStyle.Primary),
            ).addComponents(
              new ButtonBuilder()
                .setCustomId('primary2')
                .setLabel('Öneri Bileti')
                .setStyle(ButtonStyle.Success),
            ).addComponents(
              new ButtonBuilder()
                .setCustomId('primary3')
                .setLabel('Şikayet Bileti')
                .setStyle(ButtonStyle.Danger),
            );
    
          let message = channel.send({ embeds: [exampleEmbed], components: [row] });
        }).catch(console.error);
    });
    
    
    
    client.on("messageCreate", message => {
    
    
      if (message.mentions.has("225878079422201856")) {
        if (message.member.roles.cache.some(role => role.name === 'Yetkili'))
          return;
        else if (message.member.roles.cache.some(role => role.name === 'Moderatör'))
          return;
        else {
          message.member.timeout(60 * 60 * 1000, 'Barışı etiketlemekten 1 saat timeout')
          let exampleEmbed = new EmbedBuilder()
            .setColor(0x202225)
            .setTitle('Barış Zorbayı Etiketlemek Yasaktır!')
            .setDescription(` <@${message.author.id}> Lütfen Kurallar Kanalına Göz atınız
    1 saat sonra görüşmek üzere...`)
            .setImage('https://i.imgur.com/qxJ4H72.gif');
          message.author.send({ embeds: [exampleEmbed] })
        }
      }
    
      //Moderatörlerimizi etikletlemek yasaktır alanı.
      if ((message.mentions.has("667094045545201693") || message.mentions.has("724377969006739456") || message.mentions.has("225878079422201856")) && (message.channel.name.includes("kayıt"))) {
        let exampleEmbed = new EmbedBuilder()
          .setColor(0x202225)
          .setTitle('Moderatör etiketlemek yasaktır!')
          .setDescription(` <@${message.author.id}> Lütfen <#1002988417275138140> Kanalına Göz atınız`)
          .setImage('https://i.imgur.com/qxJ4H72.gif');
        message.channel.send({ embeds: [exampleEmbed] }).then(message => setTimeout(() => message.delete(), 5000))
    
        message.delete()
      }
    
    })
    
    client.on('interactionCreate', async interaction => {
      if (!interaction.isButton()) return;
      let commandname = interaction.customId;
      if (commandname === 'primary') {
        await interaction.deferUpdate();
        const guild = await client.guilds.fetch(interaction.guildId);
        await guild.channels.create({ name: "Kayıt-" + String(kayıtcounter) }, { topic: "Kayıt", type: "GUILD_TEXT" }).then(channel => {
          channel.permissionOverwrites.edit(guild.id, { ViewChannel: false });
          kayıtcounter += 1;
          channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true });
          let role = guild.roles.cache.find(role => role.name === "Yetkili");
          channel.permissionOverwrites.edit(role.id, { ViewChannel: true });
    
          let exampleEmbed = new EmbedBuilder()
            .setColor(0x202225)
            .setTitle('Hangi başvuru için bilet oluşturduğunuzu yazarak başlayın;')
            .setDescription('Biletiniz açıklayıcı, varsa tüm sorulara cevap vermiş olduğunuzdan emin olun.')
            .setImage('https://i.imgur.com/qxJ4H72.gif');
          const rowAdmin = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('inceleniyor')
                .setEmoji('🟡')
                .setLabel('İnceleniyor')
                .setStyle(ButtonStyle.Primary),
            )
            .addComponents(
              new ButtonBuilder()
                .setCustomId('kaydetvekapa')
                .setEmoji('🟢')
                .setLabel('Çözüldü')
                .setStyle(ButtonStyle.Primary),
            );
    
          const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('lock')
                .setEmoji('🔒')
                .setLabel('Bileti Kapat')
                .setStyle(ButtonStyle.Secondary),
            );
    
          let message = channel.send({ embeds: [exampleEmbed], components: [rowAdmin, row] });
        });
    
      } else if (commandname === 'primary2') {
        if (!interaction.member.roles.cache.some(role => role.id === '1003252867584512030') ) {
          let exampleEmbed = new EmbedBuilder()
            .setColor(0x202225)
            .setTitle('HATA!')
            .setDescription('Kayıt olup Aşkolar Rolünü almadan Öneri bileti oluşturamazsınız!')
            .setImage('https://i.imgur.com/qxJ4H72.gif');
          interaction.reply({ embeds: [exampleEmbed], ephemeral: true })
    
        } else {
          const guild = await client.guilds.fetch(interaction.guildId);
          await guild.channels.create({ name: "Öneri-" + String(onericounter) }, { topic: "Öneri", type: "GUILD_TEXT" }).then(channel => {
            channel.permissionOverwrites.edit(guild.id, { ViewChannel: false });
            onericounter += 1;
            channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true });
            let role = guild.roles.cache.find(role => role.name === "Yetkili");
            channel.permissionOverwrites.edit(role.id, { ViewChannel: true });
    
    
            let exampleEmbed = new EmbedBuilder()
              .setColor(0x202225)
              .setTitle('Konuyu belirterek başlayın')
              .setDescription(`Örn: ( Yeni oyun perm'i , Yeni bot talebi vs. ) 
    
          En kısa sürede sizinle iletişime geçeceğiz. Tüm önerileriniz dikkate alındığını unutmayın!`)
              .setImage('https://i.imgur.com/qxJ4H72.gif');
            const rowAdmin = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('inceleniyor')
                  .setEmoji('🟡')
                  .setLabel('İnceleniyor')
                  .setStyle(ButtonStyle.Primary),
              )
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('kaydetvekapa')
                  .setEmoji('🟢')
                  .setLabel('Çözüldü')
                  .setStyle(ButtonStyle.Primary),
              );
    
            const row = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('lock')
                  .setEmoji('🔒')
                  .setLabel('Bileti Kapat')
                  .setStyle(ButtonStyle.Secondary),
              );
    
            let message = channel.send({ embeds: [exampleEmbed], components: [rowAdmin, row] });
    
          });
          await interaction.deferUpdate();
        }
      } else if (commandname === 'primary3') {
        if (!interaction.member.roles.cache.some(role => role.id === '1003252867584512030')) {
          let exampleEmbed = new EmbedBuilder()
            .setColor(0x202225)
            .setTitle('HATA!')
            .setDescription('Kayıt olup Aşkolar Rolünü almadan Şikayet Bileti oluşturamazsınız!')
            .setImage('https://i.imgur.com/qxJ4H72.gif');
          interaction.reply({ embeds: [exampleEmbed], ephemeral: true })
    
        } else {
          const guild = await client.guilds.fetch(interaction.guildId);
          await guild.channels.create({ name: "Şikayet-" + String(sikayetcounter) }, { topic: "Şikayet", type: "GUILD_TEXT" }).then(channel => {
            channel.permissionOverwrites.edit(guild.id, { ViewChannel: false });
            sikayetcounter += 1;
            channel.permissionOverwrites.edit(interaction.user.id, { ViewChannel: true });
            let role = guild.roles.cache.find(role => role.name === "Yetkili");
            channel.permissionOverwrites.edit(role.id, { ViewChannel: true });
    
    
            let exampleEmbed = new EmbedBuilder()
              .setColor(0x202225)
              .setDescription('Bir kural ihlaliyle karşılaştıysanız, bir kullanıcı tarafından reklam alıyor ya da rahatsız ediliyorsanız, durumu SS alarak bizlerle paylaşabilirsiniz')
              .setImage('https://i.imgur.com/qxJ4H72.gif');
    
            const rowAdmin = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('inceleniyor')
                  .setEmoji('🟡')
                  .setLabel('İnceleniyor')
                  .setStyle(ButtonStyle.Primary),
              )
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('kaydetvekapa')
                  .setEmoji('🟢')
                  .setLabel('Çözüldü')
                  .setStyle(ButtonStyle.Primary),
              );
    
            const row = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('lock')
                  .setEmoji('🔒')
                  .setLabel('Bileti Kapat')
                  .setStyle(ButtonStyle.Secondary),
              );
    
            let message = channel.send({ embeds: [exampleEmbed], components: [rowAdmin, row] });
    
          });
          await interaction.deferUpdate();
        }
      }else if (commandname === 'inceleniyor'){
        if (!interaction.member.roles.cache.some(role => role.name === 'Yetkili')){
        await interaction.deferUpdate();
        const channel = await client.channels.fetch(interaction.channelId);
        console.log(channel.name)
        if (channel.name.startsWith("kayıt")){
          console.log("kayıttaasın aloo")
        let exampleEmbed = new EmbedBuilder()
        .setColor(0x202225)
        .setTitle('Biletiniz inceleniyor!')
        .setDescription(`Merhabalar , kayıt biletinizi <@${interaction.member.id}> adlı yetkili inceliyor, en kısa sürede dönüş alacaksınız lütfen beklemede kalın.`)
        .setImage('https://i.imgur.com/qxJ4H72.gif');
        let message = channel.send({ embeds: [exampleEmbed]});
        }else if (channel.name.startsWith("öneri")){
          let exampleEmbed = new EmbedBuilder()
          .setColor(0x202225)
          .setTitle('Biletiniz inceleniyor!')
          .setDescription(`Merhabalar , öneri biletinizi <@${interaction.member.id}> adlı yetkili inceliyor, en kısa sürede dönüş alacaksınız lütfen beklemede kalın.`)
          .setImage('https://i.imgur.com/qxJ4H72.gif');
          let message = channel.send({ embeds: [exampleEmbed]});
        }else if (channel.name.startsWith("şikayet")){
          let exampleEmbed = new EmbedBuilder()
          .setColor(0x202225)
          .setTitle('Biletiniz inceleniyor!')
          .setDescription(`Merhabalar , şikayet biletinizi <@${interaction.member.id}> adlı yetkili inceliyor, en kısa sürede dönüş alacaksınız lütfen beklemede kalın.`)
          .setImage('https://i.imgur.com/qxJ4H72.gif');
          let message = channel.send({ embeds: [exampleEmbed] });
        }
      }
        else if (interaction.member.roles.cache.some(role => role.name === 'Moderatör')){
        await interaction.deferUpdate();
        const channel = await client.channels.fetch(interaction.channelId);
        if (channel.name.startsWith("kayit")){
        let exampleEmbed = new EmbedBuilder()
        .setColor(0x202225)
        .setTitle('Biletiniz inceleniyor!')
        .setDescription(`Merhabalar , kayıt biletinizi <@${interaction.member.id}> adlı yetkili inceliyor, en kısa sürede dönüş alacaksınız lütfen beklemede kalın.`)
        .setImage('https://i.imgur.com/qxJ4H72.gif');
        let message = channel.send({ embeds: [exampleEmbed]});
        }else if (channel.name.startsWith("öneri")){
          let exampleEmbed = new EmbedBuilder()
          .setColor(0x202225)
          .setTitle('Biletiniz inceleniyor!')
          .setDescription(`Merhabalar , öneri biletinizi <@${interaction.member.id}> adlı yetkili inceliyor, en kısa sürede dönüş alacaksınız lütfen beklemede kalın.`)
          .setImage('https://i.imgur.com/qxJ4H72.gif');
          let message = channel.send({ embeds: [exampleEmbed]});
        }else if (channel.name.startsWith("şikayet")){
          let exampleEmbed = new EmbedBuilder()
          .setColor(0x202225)
          .setTitle('Biletiniz inceleniyor!')
          .setDescription(`Merhabalar , şikayet biletinizi <@${interaction.member.id}> adlı yetkili inceliyor, en kısa sürede dönüş alacaksınız lütfen beklemede kalın.`)
          .setImage('https://i.imgur.com/qxJ4H72.gif');
          let message = channel.send({ embeds: [exampleEmbed] });
        }
      }else {
        await interaction.deferUpdate();
        return;
      }
       
    
    
      }
      else if (commandname === 'lock') {
        const channel = await client.channels.fetch(interaction.channelId);
    
        const row = new ActionRowBuilder()
        .setComponents(
          new ButtonBuilder()
            .setLabel('Reddet')
            .setStyle(ButtonStyle.Secondary)
            .setCustomId('cancel'),
          new ButtonBuilder()
            .setLabel('Onayla')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('confirm'),
        )
        const confirmMsg = await interaction.reply({
          content : "Biletinizi Kapatmak istediğinize emin misiniz ?",
          components : [row],
          fetchReply : true
        });
      }
      else if (commandname === 'kaydetvekapa') {
        const channel = await client.channels.fetch(interaction.channelId);
        await interaction.deferUpdate();
        channel.messages.fetch({ limit: 100 }).then(messages => {
          //Iterate through the messages here with the variable "messages".
          let messageLog = "";
          messages.forEach(message => {
            messageLog += "Yazan : <@" + message.author + "> - Mesaj : " + message.content + " - EK :  ";
            message.attachments.forEach(attachment => {
              const ImageLink = attachment.proxyURL;
              messageLog += ImageLink;
            });
    
    
            messageLog += "\n";
            fs.writeFileSync(channel.name + ".txt", messageLog, (err) => { })
          })
    
        })
        let rapor = client.channels.cache.find(channel => channel.name === "bilet-dosyaları");
    
    
        setTimeout(() => {
          channel.delete()
    
          rapor.send({
            files: [{
              attachment: './' + channel.name + '.txt',
              name: channel.name + '.txt',
    
            }]
          }).then(setTimeout(() => { fs.unlinkSync('./' + channel.name + '.txt') }, 10000))
        }, 10)
    
      }
      else if (commandname === 'confirm'){
        const channel = await client.channels.fetch(interaction.channelId);
        await interaction.deferUpdate();
        let close = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('Biletiniz Kapatılıyor...')
        .setDescription('Sizlere yardımcı olmak bir zevkti. \n Bizi Tercih ettiğiniz için Teşekkürler! \n Biletiniz yakın zamanda kapatılacaktır.')
        .setImage('https://i.imgur.com/qxJ4H72.gif');
    
        await channel.send({embeds:[close]}).then(
        () => {
          setTimeout(() => {
          channel.permissionOverwrites.edit(interaction.member.id, { ViewChannel: false })},5000);
        });
    
      }else if (commandname === "cancel"){
        interaction.message.delete()
      }
    });
    
    console.log(commandFiles);
    client.login("MTAwMzA0OTg3OTYyMDI5MjcyMA.Gl_n2E.0f4mqH1aSV1kBCftVS4vSHbQPtN6aGBt0Zj9-8");
    
      console.log("kayıttaasın aloo")
    let exampleEmbed = new EmbedBuilder()
    .setColor(0x202225)
    .setTitle('Biletiniz inceleniyor!')
    .setDescription(`Merhabalar , kayıt biletinizi <@${interaction.member.id}> adlı yetkili inceliyor, en kısa sürede dönüş alacaksınız lütfen beklemede kalın.`)
    .setImage('https://i.imgur.com/qxJ4H72.gif');
    let message = channel.send({ embeds: [exampleEmbed]});
    }else if (channel.name.startsWith("öneri")){
      let exampleEmbed = new EmbedBuilder()
      .setColor(0x202225)
      .setTitle('Biletiniz inceleniyor!')
      .setDescription(`Merhabalar , öneri biletinizi <@${interaction.member.id}> adlı yetkili inceliyor, en kısa sürede dönüş alacaksınız lütfen beklemede kalın.`)
      .setImage('https://i.imgur.com/qxJ4H72.gif');
      let message = channel.send({ embeds: [exampleEmbed]});
    }else if (channel.name.startsWith("şikayet")){
      let exampleEmbed = new EmbedBuilder()
      .setColor(0x202225)
      .setTitle('Biletiniz inceleniyor!')
      .setDescription(`Merhabalar , şikayet biletinizi <@${interaction.member.id}> adlı yetkili inceliyor, en kısa sürede dönüş alacaksınız lütfen beklemede kalın.`)
      .setImage('https://i.imgur.com/qxJ4H72.gif');
      let message = channel.send({ embeds: [exampleEmbed] });
    }
  }
    else if (interaction.member.roles.cache.some(role => role.name === 'Moderatör')){
    await interaction.deferUpdate();
    const channel = await client.channels.fetch(interaction.channelId);
    if (channel.name.startsWith("kayit")){
    let exampleEmbed = new EmbedBuilder()
    .setColor(0x202225)
    .setTitle('Biletiniz inceleniyor!')
    .setDescription(`Merhabalar , kayıt biletinizi <@${interaction.member.id}> adlı yetkili inceliyor, en kısa sürede dönüş alacaksınız lütfen beklemede kalın.`)
    .setImage('https://i.imgur.com/qxJ4H72.gif');
    let message = channel.send({ embeds: [exampleEmbed]});
    }else if (channel.name.startsWith("öneri")){
      let exampleEmbed = new EmbedBuilder()
      .setColor(0x202225)
      .setTitle('Biletiniz inceleniyor!')
      .setDescription(`Merhabalar , öneri biletinizi <@${interaction.member.id}> adlı yetkili inceliyor, en kısa sürede dönüş alacaksınız lütfen beklemede kalın.`)
      .setImage('https://i.imgur.com/qxJ4H72.gif');
      let message = channel.send({ embeds: [exampleEmbed]});
    }else if (channel.name.startsWith("şikayet")){
      let exampleEmbed = new EmbedBuilder()
      .setColor(0x202225)
      .setTitle('Biletiniz inceleniyor!')
      .setDescription(`Merhabalar , şikayet biletinizi <@${interaction.member.id}> adlı yetkili inceliyor, en kısa sürede dönüş alacaksınız lütfen beklemede kalın.`)
      .setImage('https://i.imgur.com/qxJ4H72.gif');
      let message = channel.send({ embeds: [exampleEmbed] });
    }
  }else {
    await interaction.deferUpdate();
    return;
  }
   


  }
  else if (commandname === 'lock') {
    const channel = await client.channels.fetch(interaction.channelId);

    const row = new ActionRowBuilder()
    .setComponents(
      new ButtonBuilder()
        .setLabel('Reddet')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('cancel'),
      new ButtonBuilder()
        .setLabel('Onayla')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('confirm'),
    )
    const confirmMsg = await interaction.reply({
      content : "Biletinizi Kapatmak istediğinize emin misiniz ?",
      components : [row],
      fetchReply : true
    });
  }
  else if (commandname === 'kaydetvekapa') {
    const channel = await client.channels.fetch(interaction.channelId);
    await interaction.deferUpdate();
    channel.messages.fetch({ limit: 100 }).then(messages => {
      //Iterate through the messages here with the variable "messages".
      let messageLog = "";
      messages.forEach(message => {
        messageLog += "Yazan : <@" + message.author + "> - Mesaj : " + message.content + " - EK :  ";
        message.attachments.forEach(attachment => {
          const ImageLink = attachment.proxyURL;
          messageLog += ImageLink;
        });


        messageLog += "\n";
        fs.writeFileSync(channel.name + ".txt", messageLog, (err) => { })
      })

    })
    let rapor = client.channels.cache.find(channel => channel.name === "bilet-dosyaları");


    setTimeout(() => {
      channel.delete()

      rapor.send({
        files: [{
          attachment: './' + channel.name + '.txt',
          name: channel.name + '.txt',

        }]
      }).then(setTimeout(() => { fs.unlinkSync('./' + channel.name + '.txt') }, 10000))
    }, 5000)

  }
  else if (commandname === 'confirm'){
    const channel = await client.channels.fetch(interaction.channelId);
    await interaction.deferUpdate();
    let close = new EmbedBuilder()
    .setColor(0xFF0000)
    .setTitle('Biletiniz Kapatılıyor...')
    .setDescription('Sizlere yardımcı olmak bir zevkti. \n Bizi Tercih ettiğiniz için Teşekkürler! \n Biletiniz yakın zamanda kapatılacaktır.')
    .setImage('https://i.imgur.com/qxJ4H72.gif');

    await channel.send({embeds:[close]}).then(
    () => {
      setTimeout(() => {
      channel.permissionOverwrites.edit(interaction.member.id, { ViewChannel: false })},5000);
    });

  }else if (commandname === "cancel"){
    interaction.message.delete()
  }
});

client.login(process.env.DB_TOKEN);

