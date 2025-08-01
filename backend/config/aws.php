<?php

return [
	'credentials' => [
		'key' => env('AWS_ACCESS_KEY_ID'),
		'secret' => env('AWS_ACCESS_KEY_ID'),
	],
	'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
	'version' => 'latest',
	'bucket' => env('AWS_BUCKET'),
	'url' => env('AWS_URL')
];