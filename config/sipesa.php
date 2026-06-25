<?php

return [
    'iot' => [
        'device_token_length' => (int) env('IOT_DEVICE_TOKEN_LENGTH', 64),
        'offline_threshold_minutes' => (int) env('IOT_OFFLINE_THRESHOLD_MINUTES', 15),
    ],

    'warehouse' => [
        'latitude' => (float) env('WAREHOUSE_LATITUDE', -6.374672),
        'longitude' => (float) env('WAREHOUSE_LONGITUDE', 106.924831),
    ],

    'petugas' => [
        'confirm_radius_meters' => (int) env('PETUGAS_CONFIRM_RADIUS_METERS', 50),
    ],

    'trash_bin' => [
        'status_empty_max' => (float) env('TONG_STATUS_EMPTY_MAX', 40),
        'status_medium_max' => (float) env('TONG_STATUS_MEDIUM_MAX', 75),
    ],
];
