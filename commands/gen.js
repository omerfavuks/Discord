// Dependencies
const { MessageEmbed, Message } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');
const CatLoggr = require('cat-loggr');

// Functions
const log = new CatLoggr();
const generated = new Set();

module.exports = {
    name: 'hesap', // Command name
    description: 'Hesap oluşturur.', // Command description

    /**
     * Command exetute
     * @param {Message} message The message sent by user
     * @param {Array[]} args Arguments splitted by spaces after the command name
     */
    execute(message, args) {
        // If the generator channel is not given in config or invalid
        try {
            message.client.channels.cache.get(config.genChannel).id; // Try to get the channel's id
        } catch (error) {
            if (error) log.error(error); // If an error occured log to console

            // Send error messsage if the "error_message" field is "true" in the configuration
            if (config.command.error_message === true) {
                return message.channel.send(
                    new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Hata!')
                        .setDescription('Hesap oluşturma kanalı seçilmedi!')
                        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                        .setTimestamp()
                );
            } else return;
        };

        // If the message channel id is the generator channel id in configuration
        if (message.channel.id === config.genChannel) {
            // If the user have cooldown on the command
            if (generated.has(message.author.id)) {
                return message.channel.send(
                    new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Dur!!')
                        .setDescription('lütfen biraz bekleyiniz')
                        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                        .setTimestamp()
                );
            } else {
                // Parameters
                const service = args[0];

                // If the "service" parameter is missing
                if (!service) {
                    return message.channel.send(
                        new MessageEmbed()
                            .setColor(config.color.red)
                            .setTitle('Bulunamadı!')
                            .setDescription('stok ismi giriniz!')
                            .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                            .setTimestamp()
                    );
                };

                // File path to find the given service
                const filePath = `${__dirname}/../stok/${args[0]}.txt`;

                // Read the service file
                fs.readFile(filePath, function(error, data) {
                    // If no error
                    if (!error) {
                        data = data.toString(); // Stringify the content

                        const position = data.toString().indexOf('\n'); // Get position
                        const firstLine = data.split('\n')[0]; // Get the first line

                        // If the service file is empty
                        if (position === -1) {
                            return message.channel.send(
                                new MessageEmbed()
                                    .setColor(config.color.red)
                                    .setTitle('Oluşturulamadı!')
                                    .setDescription(`İstediğiniz \`${args[0]}\` stokda kalmadı!`)
                                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                    .setTimestamp()
                            );
                        };

                        // Send messages to the user
                        message.author.send(
                            new MessageEmbed()
                                .setColor(config.color.green)
                                .setTitle('Hesap oluşturuldu!')
                                .addField('Service', `\`\`\`${args[0][0].toUpperCase()}${args[0].slice(1).toLowerCase()}\`\`\``, true)
                                .addField('Account', `\`\`\`${firstLine}\`\`\``, true)
                                .setTimestamp()
                        )


                        // Send message to the channel if the user recieved the message
                        if (position !== -1) {
                            data = data.substr(position + 1); // Remove the gernerated account line

                            // Write changes
                            fs.writeFile(filePath, data, function(error) {
                                message.channel.send(
                                    new MessageEmbed()
                                        .setColor(config.color.green)
                                        .setTitle('Hesabınız oluşturuldu!')
                                        .setDescription(`Dm ni kontrol et ${message.author}! *mesaj gelmediyse hesabına mesaj gönderilmesini aç!*`)
                                        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                        .setTimestamp()
                                );

                                generated.add(message.author.id); // Add user to the cooldown set

                                // Set cooldown time
                                setTimeout(() => {
                                    generated.delete(message.author.id); // Remove the user from the cooldown set after expire
                                }, config.genCooldown);

                                if (error) return log.error(error); // If an error occured, log to console
                            });
                        } else {
                            // If the service is empty
                            return message.channel.send(
                                new MessageEmbed()
                                    .setColor(config.color.red)
                                    .setTitle('Hata!')
                                    .setDescription(`bu \`${args[0]}\` stok boş!`)
                                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                    .setTimestamp()
                            );
                        };
                    } else {
                        // If the service does not exists
                        return message.channel.send(
                            new MessageEmbed()
                                .setColor(config.color.red)
                                .setTitle('Hata!')
                                .setDescription(`aradığınız \`${args[0]}\` bulunamadı`)
                                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                .setTimestamp()
                        );
                    };
                });
            };
        } else {
            // If the command executed in another channel
            message.channel.send(
                new MessageEmbed()
                    .setColor(config.color.red)
                    .setTitle('Hata!')
                    .setDescription(` \`hesap\` komudunu kullanabilmek için  <#${config.genChannel}> kanalını kullanmalısınız`)
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    .setTimestamp()
            );
        };
    }
};
