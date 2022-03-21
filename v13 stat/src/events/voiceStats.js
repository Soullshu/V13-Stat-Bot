const conf = require("../configs/config.json");
const joinedAt = require("../schemas/voiceJoinedAt");
const voiceUser = require("../schemas/voiceUser");
const voiceGuild = require("../schemas/voiceGuild");
const guildChannel = require("../schemas/voiceGuildChannel");
const userChannel = require("../schemas/voiceUserChannel");
const userParent = require("../schemas/voiceUserParent");
const { MessageEmbed } = require("discord.js");
const coin = require("../schemas/coin");
const client = global.client;

/**
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 * @returns {Promise<void>}
 */
module.exports = async (oldState, newState) => {
  if ((oldState.member && oldState.member.user.bot) || (newState.member && newState.member.user.bot)) return;

  if (!oldState.channel  && newState.channelID) await joinedAt.findOneAndUpdate({ userID: newState.id }, { $set: { date: Date.now() } }, { upsert: true });
  let joinedAtData = await joinedAt.findOne({ userID: oldState.id });
  if (!joinedAtData) await joinedAt.findOneAndUpdate({ userID: oldState.id }, { $set: { date: Date.now() } }, { upsert: true });
  joinedAtData = await joinedAt.findOne({ userID: oldState.id });
  const data = Date.now() - joinedAtData.date;

  if (oldState.channel  && !newState.channelID) {
    await saveData(oldState, oldState.channel, data);
    await joinedAt.deleteOne({ userID: oldState.id });
  } else if (oldState.channel  && newState.channelID) {
    await saveData(oldState, oldState.channel, data);
    await joinedAt.findOneAndUpdate({ userID: oldState.id }, { $set: { date: Date.now() } }, { upsert: true });
  }
};

/**
 * @param {VoiceState} user
 * @param {VoiceChannel} channel
 * @param {Number} data
 * @returns {Promise<void>}
 */
async function saveData(user, channel, data) {
 await voiceUser.findOneAndUpdate({ guildID: user.guild.id, userID: user.id }, { $inc: { topStat: data, dailyStat: data, weeklyStat: data, twoWeeklyStat: data } }, { upsert: true });
  await voiceGuild.findOneAndUpdate({ guildID: user.guild.id }, { $inc: { topStat: data, dailyStat: data, weeklyStat: data, twoWeeklyStat: data } }, { upsert: true });
  await guildChannel.findOneAndUpdate({ guildID: user.guild.id, channelID: channel.id }, { $inc: { channelData: data } }, { upsert: true });
  await userChannel.findOneAndUpdate({ guildID: user.guild.id, userID: user.id, channelID: channel.id }, { $inc: { channelData: data } }, { upsert: true });
  if (channel.parent) await userParent.findOneAndUpdate({ guildID: user.guild.id, userID: user.id, parentID: channel.parentID }, { $inc: { parentData: data } }, { upsert: true });
}

module.exports.conf = {
  name: "voiceStateUpdate",
};
