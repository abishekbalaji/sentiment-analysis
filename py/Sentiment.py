import tweepy
import re
import sys
import os

from tweepy import OAuthHandler

consumer_api_key = '13eWd32SQfq3LJENzDvavQr67'
consumer_api_secret = 'a5jGg2mmcaEVKLJBaWsB4ud6XRa18cFsojxc1im417a5O2QlEJ'
access_token = '1133960670024568832-j3venINUQZfot0Mv4mYTwOXDQyTNkQ'
access_token_secret = 'R3feDrMW0LV2yed9wNpAOa94t9oQXXH7NCgfDQkLUXvYK'

authorizer = OAuthHandler(consumer_api_key, consumer_api_secret)
authorizer.set_access_token(access_token, access_token_secret)

api = tweepy.API(authorizer, timeout=15)

all_tweets = []

search_query = sys.argv[1]
print(search_query)
for tweet_object in tweepy.Cursor(api.search, q=search_query+" -filter:retweets", lang='en', result_type='recent').items(50):
    all_tweets.append(tweet_object.text)
processed_tweets = []
for tweet in all_tweets:

    # Remove all the special characters
    processed_tweet = re.sub(r'\W', ' ', str(tweet))

    # remove all single characters
    processed_tweet = re.sub(r'\s+[a-zA-Z]\s+', ' ', processed_tweet)

    # Remove single characters from the start
    processed_tweet = re.sub(r'\^[a-zA-Z]\s+', ' ', processed_tweet)

    # Substituting multiple spaces with single space
    processed_tweet = re.sub(r'\s+', ' ', processed_tweet, flags=re.I)

    # Removing prefixed 'b'
    processed_tweet = re.sub(r'^b\s+', '', processed_tweet)

    # Converting to Lowercase
    processed_tweet = processed_tweet.lower()

    processed_tweet = processed_tweet.strip()

    processed_tweets.append(processed_tweet)

# print(processed_tweets)

f = open("uploads/" + search_query + ".txt", 'x')
print("file created")
for tweet in processed_tweets:
    with open("uploads/" + search_query + ".txt", 'a') as f:
        f.write(tweet + "\n")
f.close()


# for tweet in processed_tweets:
#   with open(search_query + ".txt", 'a') as f:
#     f.write(tweet)
sys.stdout.flush()
