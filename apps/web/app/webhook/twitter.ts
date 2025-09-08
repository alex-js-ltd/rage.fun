import { type TwitterApiReadWrite, TwitterApi } from 'twitter-api-v2'
import { getServerEnv } from '@/app/utils/env'
import { generateSolanaBlink } from '@/app/utils/dialect'
import { AirdropSignatureType } from '../utils/schemas'

const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET } = getServerEnv()

const shortAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`

async function sendAirdropAlertToTwitter(airdropSignature: AirdropSignatureType) {
	const client = new TwitterApi({
		appKey: TWITTER_API_KEY,
		appSecret: TWITTER_API_SECRET,
		accessToken: TWITTER_ACCESS_TOKEN,
		accessSecret: TWITTER_ACCESS_TOKEN_SECRET,
	})

	// Enable read-write operations
	const twitterClient = client.readWrite

	const {
		id: signature,
		tokenId: mint,
		airdropId,
		airdropEvents: events,
		token: {
			symbol,
			bondingCurve: { decimals },
		},
	} = airdropSignature

	const userInfoLines = events.map(event => {
		const shortPk = shortAddress(event.user)
		return [`├${shortPk}`].join('\n')
	})

	const solScanUrl = `https://solscan.io/tx/${signature}`
	const dialectUrl = generateSolanaBlink(mint)

	const text1 = [
		`🪂 AIRDROP #${airdropId} UNLOCKED 🪂`,
		``,
		`Retweet, like, comment + mint 🔁❤️💬🌿 to unlock more`,

		'',
		'🔗 LINKS',
		` ├ solscan.io: ${solScanUrl}`,
		` ├ Buy on Dialect: ${dialectUrl}`,
	].join('\n')

	const text2 = ['👤 USERS', ...userInfoLines].join('\n')

	try {
		const first = await twitterClient.v2.tweet(text1)

		const parentTweetId = first.data.id

		// Send reply tweet
		const reply = await twitterClient.v2.tweet({
			text: text2,
			reply: {
				in_reply_to_tweet_id: parentTweetId,
			},
		})
	} catch (error) {
		console.error('Error sending alert to twitter:', error)
	}
}

export { sendAirdropAlertToTwitter }
