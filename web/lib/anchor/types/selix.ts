/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/selix.json`.
 */
export type Selix = {
  "address": "J444nFUBaia7rWb9VweAwBUq23pqcPeSQvKvKxVbHMD3",
  "metadata": {
    "name": "selix",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "cancelListing",
      "docs": [
        "Cancel a listing and return funds"
      ],
      "discriminator": [
        41,
        183,
        50,
        232,
        230,
        233,
        157,
        70
      ],
      "accounts": [
        {
          "name": "maker",
          "writable": true,
          "signer": true,
          "relations": [
            "listing"
          ]
        },
        {
          "name": "makerProfile",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "maker"
              }
            ]
          }
        },
        {
          "name": "listing",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  115,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "maker"
              },
              {
                "kind": "account",
                "path": "listing.id",
                "account": "listing"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "listing"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintSource"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "makerTokenAccountSource",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "maker"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintSource"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenMintSource"
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": []
    },
    {
      "name": "closeExpiredListing",
      "docs": [
        "Close an expired listing (anyone can call)"
      ],
      "discriminator": [
        150,
        70,
        13,
        135,
        9,
        204,
        75,
        4
      ],
      "accounts": [
        {
          "name": "closer",
          "writable": true,
          "signer": true
        },
        {
          "name": "maker",
          "writable": true,
          "relations": [
            "listing"
          ]
        },
        {
          "name": "platform",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "platform.authority",
                "account": "platform"
              }
            ]
          }
        },
        {
          "name": "listing",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  115,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "maker"
              },
              {
                "kind": "account",
                "path": "listing.id",
                "account": "listing"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "listing"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintSource"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "makerTokenAccountSource",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "maker"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintSource"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenMintSource"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createListing",
      "docs": [
        "Create a new swap listing"
      ],
      "discriminator": [
        18,
        168,
        45,
        24,
        191,
        31,
        117,
        54
      ],
      "accounts": [
        {
          "name": "maker",
          "writable": true,
          "signer": true
        },
        {
          "name": "makerProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "maker"
              }
            ]
          }
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "platform.authority",
                "account": "platform"
              }
            ]
          }
        },
        {
          "name": "listing",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  115,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "maker"
              },
              {
                "kind": "arg",
                "path": "params.id"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "listing"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintSource"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "makerTokenAccountSource",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "maker"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintSource"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenMintSource"
        },
        {
          "name": "tokenMintDestination"
        },
        {
          "name": "sourceWhitelist",
          "docs": [
            "Optional: required when platform.whitelist_enabled is true"
          ],
          "optional": true
        },
        {
          "name": "destWhitelist",
          "docs": [
            "Optional: required when platform.whitelist_enabled is true"
          ],
          "optional": true
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createListingParams"
            }
          }
        }
      ]
    },
    {
      "name": "executeSwap",
      "docs": [
        "Execute a swap (full or partial)"
      ],
      "discriminator": [
        56,
        182,
        124,
        215,
        155,
        140,
        157,
        102
      ],
      "accounts": [
        {
          "name": "taker",
          "writable": true,
          "signer": true
        },
        {
          "name": "takerProfile",
          "writable": true,
          "optional": true
        },
        {
          "name": "maker",
          "docs": [
            "Validated via has_one on listing."
          ],
          "writable": true,
          "relations": [
            "listing"
          ]
        },
        {
          "name": "makerProfile",
          "writable": true,
          "optional": true
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "platform.authority",
                "account": "platform"
              }
            ]
          }
        },
        {
          "name": "feeCollector"
        },
        {
          "name": "listing",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  115,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "maker"
              },
              {
                "kind": "account",
                "path": "listing.id",
                "account": "listing"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "listing"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintSource"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "takerTokenAccountSource",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "taker"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintSource"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "takerTokenAccountDestination",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "taker"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintDestination"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "makerTokenAccountDestination",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "maker"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintDestination"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "feeCollectorTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "feeCollector"
              },
              {
                "kind": "account",
                "path": "tokenProgram"
              },
              {
                "kind": "account",
                "path": "tokenMintDestination"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenMintSource"
        },
        {
          "name": "tokenMintDestination"
        },
        {
          "name": "tokenProgram"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "executeSwapParams"
            }
          }
        }
      ]
    },
    {
      "name": "initializePlatform",
      "docs": [
        "Initialize the platform (one-time setup)"
      ],
      "discriminator": [
        119,
        201,
        101,
        45,
        75,
        122,
        89,
        3
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "feeCollector"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "initializePlatformParams"
            }
          }
        }
      ]
    },
    {
      "name": "initializeUser",
      "docs": [
        "Initialize user profile"
      ],
      "discriminator": [
        111,
        17,
        185,
        250,
        60,
        122,
        38,
        254
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "referrer",
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "initializeUserParams"
            }
          }
        }
      ]
    },
    {
      "name": "manageWhitelist",
      "docs": [
        "Manage token whitelist"
      ],
      "discriminator": [
        252,
        197,
        13,
        121,
        14,
        54,
        39,
        93
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "platform"
          ]
        },
        {
          "name": "platform",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "whitelistEntry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  104,
                  105,
                  116,
                  101,
                  108,
                  105,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "isWhitelisted",
          "type": "bool"
        }
      ]
    },
    {
      "name": "pausePlatform",
      "docs": [
        "Pause the platform (emergency stop)"
      ],
      "discriminator": [
        232,
        46,
        204,
        130,
        181,
        0,
        172,
        57
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "platform"
          ]
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "resumePlatform",
      "docs": [
        "Resume the platform"
      ],
      "discriminator": [
        23,
        162,
        56,
        123,
        186,
        207,
        109,
        131
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "platform"
          ]
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "setFeeCollector",
      "docs": [
        "Set fee collector address"
      ],
      "discriminator": [
        143,
        46,
        10,
        113,
        121,
        157,
        245,
        166
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "platform"
          ]
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "newFeeCollector"
        }
      ],
      "args": []
    },
    {
      "name": "updateConfig",
      "docs": [
        "Update platform configuration"
      ],
      "discriminator": [
        29,
        158,
        252,
        191,
        10,
        83,
        219,
        99
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "platform"
          ]
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updateConfigParams"
            }
          }
        }
      ]
    },
    {
      "name": "updateListing",
      "docs": [
        "Update an existing listing"
      ],
      "discriminator": [
        192,
        174,
        210,
        68,
        116,
        40,
        242,
        253
      ],
      "accounts": [
        {
          "name": "maker",
          "writable": true,
          "signer": true,
          "relations": [
            "listing"
          ]
        },
        {
          "name": "platform",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              },
              {
                "kind": "account",
                "path": "platform.authority",
                "account": "platform"
              }
            ]
          }
        },
        {
          "name": "listing",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  105,
                  115,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "maker"
              },
              {
                "kind": "account",
                "path": "listing.id",
                "account": "listing"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updateListingParams"
            }
          }
        }
      ]
    },
    {
      "name": "updatePreferences",
      "docs": [
        "Update user preferences"
      ],
      "discriminator": [
        16,
        64,
        128,
        133,
        19,
        206,
        101,
        159
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true,
          "relations": [
            "userProfile"
          ]
        },
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updatePreferencesParams"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "listing",
      "discriminator": [
        218,
        32,
        50,
        73,
        43,
        134,
        26,
        58
      ]
    },
    {
      "name": "platform",
      "discriminator": [
        77,
        92,
        204,
        58,
        187,
        98,
        91,
        12
      ]
    },
    {
      "name": "tokenWhitelist",
      "discriminator": [
        105,
        240,
        104,
        47,
        95,
        13,
        48,
        78
      ]
    },
    {
      "name": "userProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
      ]
    }
  ],
  "events": [
    {
      "name": "feeCollectorUpdated",
      "discriminator": [
        13,
        42,
        159,
        224,
        200,
        161,
        65,
        247
      ]
    },
    {
      "name": "listingCancelled",
      "discriminator": [
        11,
        46,
        163,
        10,
        103,
        80,
        139,
        194
      ]
    },
    {
      "name": "listingCreated",
      "discriminator": [
        94,
        164,
        167,
        255,
        246,
        186,
        12,
        96
      ]
    },
    {
      "name": "listingExpired",
      "discriminator": [
        86,
        77,
        98,
        166,
        213,
        159,
        72,
        61
      ]
    },
    {
      "name": "listingUpdated",
      "discriminator": [
        190,
        215,
        199,
        138,
        255,
        248,
        98,
        62
      ]
    },
    {
      "name": "platformConfigUpdated",
      "discriminator": [
        198,
        206,
        187,
        204,
        148,
        251,
        237,
        25
      ]
    },
    {
      "name": "platformInitialized",
      "discriminator": [
        16,
        222,
        212,
        5,
        213,
        140,
        112,
        162
      ]
    },
    {
      "name": "platformPaused",
      "discriminator": [
        110,
        72,
        152,
        13,
        0,
        222,
        149,
        129
      ]
    },
    {
      "name": "platformResumed",
      "discriminator": [
        176,
        158,
        132,
        76,
        250,
        110,
        155,
        119
      ]
    },
    {
      "name": "swapExecuted",
      "discriminator": [
        150,
        166,
        26,
        225,
        28,
        89,
        38,
        79
      ]
    },
    {
      "name": "tokenWhitelistUpdated",
      "discriminator": [
        130,
        16,
        11,
        103,
        167,
        150,
        27,
        192
      ]
    },
    {
      "name": "userPreferencesUpdated",
      "discriminator": [
        141,
        220,
        200,
        101,
        194,
        16,
        87,
        51
      ]
    },
    {
      "name": "userProfileCreated",
      "discriminator": [
        175,
        83,
        79,
        167,
        6,
        194,
        72,
        125
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "platformPaused",
      "msg": "Platform is currently paused"
    },
    {
      "code": 6001,
      "name": "platformNotPaused",
      "msg": "Platform is not paused"
    },
    {
      "code": 6002,
      "name": "unauthorizedAuthority",
      "msg": "Unauthorized: Only platform authority can perform this action"
    },
    {
      "code": 6003,
      "name": "invalidFeeConfiguration",
      "msg": "Invalid fee configuration: must be between 0 and 1000 basis points"
    },
    {
      "code": 6004,
      "name": "platformAlreadyInitialized",
      "msg": "Platform already initialized"
    },
    {
      "code": 6005,
      "name": "invalidDurationBounds",
      "msg": "Invalid duration bounds: min must be less than max"
    },
    {
      "code": 6006,
      "name": "invalidAmount",
      "msg": "Invalid amount: must be greater than zero"
    },
    {
      "code": 6007,
      "name": "amountTooSmall",
      "msg": "Amount too small: below minimum trade amount"
    },
    {
      "code": 6008,
      "name": "sameTokenMints",
      "msg": "Invalid token mints: source and destination must be different"
    },
    {
      "code": 6009,
      "name": "durationTooShort",
      "msg": "Listing duration too short"
    },
    {
      "code": 6010,
      "name": "durationTooLong",
      "msg": "Listing duration too long"
    },
    {
      "code": 6011,
      "name": "listingExpired",
      "msg": "Listing has expired"
    },
    {
      "code": 6012,
      "name": "listingNotActive",
      "msg": "Listing is not active"
    },
    {
      "code": 6013,
      "name": "listingAlreadyCompleted",
      "msg": "Listing already completed"
    },
    {
      "code": 6014,
      "name": "invalidListingStatus",
      "msg": "Invalid listing status for this operation"
    },
    {
      "code": 6015,
      "name": "maxListingsReached",
      "msg": "User has reached maximum active listings limit"
    },
    {
      "code": 6016,
      "name": "minFillAmountTooLarge",
      "msg": "Minimum fill amount too large"
    },
    {
      "code": 6017,
      "name": "listingNotExpired",
      "msg": "Listing not expired yet"
    },
    {
      "code": 6018,
      "name": "slippageExceeded",
      "msg": "Slippage tolerance exceeded"
    },
    {
      "code": 6019,
      "name": "fillAmountTooSmall",
      "msg": "Fill amount below minimum"
    },
    {
      "code": 6020,
      "name": "insufficientMakerBalance",
      "msg": "Insufficient maker balance"
    },
    {
      "code": 6021,
      "name": "insufficientTakerBalance",
      "msg": "Insufficient taker balance"
    },
    {
      "code": 6022,
      "name": "swapAmountExceedsRemaining",
      "msg": "Invalid swap amount: exceeds remaining"
    },
    {
      "code": 6023,
      "name": "cannotSwapOwnListing",
      "msg": "Cannot swap with own listing"
    },
    {
      "code": 6024,
      "name": "tokenNotWhitelisted",
      "msg": "Token mint not whitelisted"
    },
    {
      "code": 6025,
      "name": "tokenBlacklisted",
      "msg": "Token mint is blacklisted"
    },
    {
      "code": 6026,
      "name": "invalidTokenAccount",
      "msg": "Invalid token account"
    },
    {
      "code": 6027,
      "name": "tokenAccountMintMismatch",
      "msg": "Token account mint mismatch"
    },
    {
      "code": 6028,
      "name": "tokenAccountAuthorityMismatch",
      "msg": "Token account authority mismatch"
    },
    {
      "code": 6029,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6030,
      "name": "arithmeticUnderflow",
      "msg": "Arithmetic underflow"
    },
    {
      "code": 6031,
      "name": "divisionByZero",
      "msg": "Division by zero"
    },
    {
      "code": 6032,
      "name": "invalidCalculation",
      "msg": "Invalid calculation result"
    },
    {
      "code": 6033,
      "name": "userProfileAlreadyExists",
      "msg": "User profile already exists"
    },
    {
      "code": 6034,
      "name": "userProfileNotFound",
      "msg": "User profile not found"
    },
    {
      "code": 6035,
      "name": "invalidReferrer",
      "msg": "Invalid referrer"
    },
    {
      "code": 6036,
      "name": "vaultDepositFailed",
      "msg": "Failed to transfer tokens to vault"
    },
    {
      "code": 6037,
      "name": "vaultWithdrawalFailed",
      "msg": "Failed to withdraw tokens from vault"
    },
    {
      "code": 6038,
      "name": "vaultClosureFailed",
      "msg": "Failed to close vault"
    },
    {
      "code": 6039,
      "name": "vaultBalanceMismatch",
      "msg": "Vault balance mismatch"
    },
    {
      "code": 6040,
      "name": "invalidPda",
      "msg": "Invalid PDA derivation"
    },
    {
      "code": 6041,
      "name": "accountAlreadyClosed",
      "msg": "Account already closed"
    },
    {
      "code": 6042,
      "name": "invalidAccountOwner",
      "msg": "Invalid account owner"
    },
    {
      "code": 6043,
      "name": "accountNotInitialized",
      "msg": "Account not initialized"
    }
  ],
  "types": [
    {
      "name": "createListingParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "amountSource",
            "type": "u64"
          },
          {
            "name": "amountDestination",
            "type": "u64"
          },
          {
            "name": "minFillAmount",
            "type": "u64"
          },
          {
            "name": "maxSlippageBps",
            "type": "u16"
          },
          {
            "name": "durationSeconds",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "executeSwapParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amountSource",
            "type": "u64"
          },
          {
            "name": "maxAmountDestination",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "feeCollectorUpdated",
      "docs": [
        "Emitted when fee collector is updated"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "oldCollector",
            "type": "pubkey"
          },
          {
            "name": "newCollector",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "initializePlatformParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeBasisPoints",
            "type": "u16"
          },
          {
            "name": "minListingDuration",
            "type": "i64"
          },
          {
            "name": "maxListingDuration",
            "type": "i64"
          },
          {
            "name": "minTradeAmount",
            "type": "u64"
          },
          {
            "name": "maxListingsPerUser",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "initializeUserParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "referrer",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "defaultListingDuration",
            "type": "i64"
          },
          {
            "name": "defaultSlippageBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "listing",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "docs": [
              "Unique listing identifier"
            ],
            "type": "u64"
          },
          {
            "name": "maker",
            "docs": [
              "Listing creator"
            ],
            "type": "pubkey"
          },
          {
            "name": "tokenMintSource",
            "docs": [
              "Token being offered (source)"
            ],
            "type": "pubkey"
          },
          {
            "name": "tokenMintDestination",
            "docs": [
              "Token being requested (destination)"
            ],
            "type": "pubkey"
          },
          {
            "name": "amountSourceTotal",
            "docs": [
              "Original amount of source tokens"
            ],
            "type": "u64"
          },
          {
            "name": "amountSourceRemaining",
            "docs": [
              "Remaining amount of source tokens"
            ],
            "type": "u64"
          },
          {
            "name": "amountDestinationTotal",
            "docs": [
              "Original amount of destination tokens wanted"
            ],
            "type": "u64"
          },
          {
            "name": "amountDestinationRemaining",
            "docs": [
              "Remaining amount of destination tokens wanted"
            ],
            "type": "u64"
          },
          {
            "name": "minFillAmount",
            "docs": [
              "Minimum fill amount (for partial swaps)"
            ],
            "type": "u64"
          },
          {
            "name": "maxSlippageBps",
            "docs": [
              "Maximum slippage tolerance in basis points"
            ],
            "type": "u16"
          },
          {
            "name": "expiresAt",
            "docs": [
              "Listing expiration timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Listing creation timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Last update timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "status",
            "docs": [
              "Current status"
            ],
            "type": {
              "defined": {
                "name": "listingStatus"
              }
            }
          },
          {
            "name": "fillCount",
            "docs": [
              "Number of partial fills executed"
            ],
            "type": "u16"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "listingCancelled",
      "docs": [
        "Emitted when a listing is cancelled"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "listingId",
            "type": "u64"
          },
          {
            "name": "maker",
            "type": "pubkey"
          },
          {
            "name": "amountReturned",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "listingCreated",
      "docs": [
        "Emitted when a new listing is created"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "listingId",
            "type": "u64"
          },
          {
            "name": "maker",
            "type": "pubkey"
          },
          {
            "name": "tokenMintSource",
            "type": "pubkey"
          },
          {
            "name": "tokenMintDestination",
            "type": "pubkey"
          },
          {
            "name": "amountSource",
            "type": "u64"
          },
          {
            "name": "amountDestination",
            "type": "u64"
          },
          {
            "name": "minFillAmount",
            "type": "u64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "listingExpired",
      "docs": [
        "Emitted when a listing expires"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "listingId",
            "type": "u64"
          },
          {
            "name": "maker",
            "type": "pubkey"
          },
          {
            "name": "closer",
            "type": "pubkey"
          },
          {
            "name": "amountReturned",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "listingStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "active"
          },
          {
            "name": "partiallyFilled"
          },
          {
            "name": "completed"
          },
          {
            "name": "cancelled"
          },
          {
            "name": "expired"
          }
        ]
      }
    },
    {
      "name": "listingUpdated",
      "docs": [
        "Emitted when a listing is updated"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "listingId",
            "type": "u64"
          },
          {
            "name": "maker",
            "type": "pubkey"
          },
          {
            "name": "oldAmountDestination",
            "type": "u64"
          },
          {
            "name": "newAmountDestination",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "platform",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Platform authority (can update config)"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeCollector",
            "docs": [
              "Fee collector address"
            ],
            "type": "pubkey"
          },
          {
            "name": "feeBasisPoints",
            "docs": [
              "Trading fee in basis points (0-1000 = 0-10%)"
            ],
            "type": "u16"
          },
          {
            "name": "minListingDuration",
            "docs": [
              "Minimum listing duration in seconds"
            ],
            "type": "i64"
          },
          {
            "name": "maxListingDuration",
            "docs": [
              "Maximum listing duration in seconds"
            ],
            "type": "i64"
          },
          {
            "name": "minTradeAmount",
            "docs": [
              "Minimum trade amount (prevents dust)"
            ],
            "type": "u64"
          },
          {
            "name": "maxListingsPerUser",
            "docs": [
              "Maximum active listings per user"
            ],
            "type": "u16"
          },
          {
            "name": "isPaused",
            "docs": [
              "Platform paused state"
            ],
            "type": "bool"
          },
          {
            "name": "whitelistEnabled",
            "docs": [
              "Whitelist enabled (if true, only whitelisted tokens allowed)"
            ],
            "type": "bool"
          },
          {
            "name": "totalListingsCreated",
            "docs": [
              "Total listings created (counter)"
            ],
            "type": "u64"
          },
          {
            "name": "totalSwapsExecuted",
            "docs": [
              "Total swaps executed (counter)"
            ],
            "type": "u64"
          },
          {
            "name": "totalVolumeTraded",
            "docs": [
              "Total volume traded (in lamports equivalent)"
            ],
            "type": "u128"
          },
          {
            "name": "totalFeesCollected",
            "docs": [
              "Total fees collected"
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Platform creation timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Last config update timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "platformConfigUpdated",
      "docs": [
        "Emitted when platform config is updated"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "feeBasisPoints",
            "type": "u16"
          },
          {
            "name": "minListingDuration",
            "type": "i64"
          },
          {
            "name": "maxListingDuration",
            "type": "i64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "platformInitialized",
      "docs": [
        "Emitted when platform is initialized"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "feeCollector",
            "type": "pubkey"
          },
          {
            "name": "feeBasisPoints",
            "type": "u16"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "platformPaused",
      "docs": [
        "Emitted when platform is paused"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "platformResumed",
      "docs": [
        "Emitted when platform is resumed"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "swapExecuted",
      "docs": [
        "Emitted when a swap is executed"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "listingId",
            "type": "u64"
          },
          {
            "name": "maker",
            "type": "pubkey"
          },
          {
            "name": "taker",
            "type": "pubkey"
          },
          {
            "name": "tokenMintSource",
            "type": "pubkey"
          },
          {
            "name": "tokenMintDestination",
            "type": "pubkey"
          },
          {
            "name": "amountSource",
            "type": "u64"
          },
          {
            "name": "amountDestination",
            "type": "u64"
          },
          {
            "name": "feeAmount",
            "type": "u64"
          },
          {
            "name": "isPartial",
            "type": "bool"
          },
          {
            "name": "remainingSource",
            "type": "u64"
          },
          {
            "name": "newStatus",
            "type": {
              "defined": {
                "name": "listingStatus"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tokenWhitelist",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "docs": [
              "The token mint this entry refers to"
            ],
            "type": "pubkey"
          },
          {
            "name": "isWhitelisted",
            "docs": [
              "Whether the token is currently whitelisted"
            ],
            "type": "bool"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Timestamp when this entry was created or last updated"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tokenWhitelistUpdated",
      "docs": [
        "Emitted when token whitelist is updated"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "isWhitelisted",
            "type": "bool"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "updateConfigParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeBasisPoints",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "minListingDuration",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "maxListingDuration",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "minTradeAmount",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "maxListingsPerUser",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "whitelistEnabled",
            "type": {
              "option": "bool"
            }
          }
        ]
      }
    },
    {
      "name": "updateListingParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "newAmountDestination",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "newMinFillAmount",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "newMaxSlippageBps",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "extendDurationSeconds",
            "type": {
              "option": "i64"
            }
          }
        ]
      }
    },
    {
      "name": "updatePreferencesParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "defaultListingDuration",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "defaultSlippageBps",
            "type": {
              "option": "u16"
            }
          }
        ]
      }
    },
    {
      "name": "userPreferencesUpdated",
      "docs": [
        "Emitted when user preferences are updated"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "defaultListingDuration",
            "type": "i64"
          },
          {
            "name": "defaultSlippageBps",
            "type": "u16"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "docs": [
              "User wallet address"
            ],
            "type": "pubkey"
          },
          {
            "name": "referrer",
            "docs": [
              "Referrer (if any)"
            ],
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "listingsCreated",
            "docs": [
              "Total listings created"
            ],
            "type": "u64"
          },
          {
            "name": "listingsCancelled",
            "docs": [
              "Total listings cancelled"
            ],
            "type": "u64"
          },
          {
            "name": "swapsExecuted",
            "docs": [
              "Total swaps executed (as taker)"
            ],
            "type": "u64"
          },
          {
            "name": "swapsReceived",
            "docs": [
              "Total swaps received (as maker)"
            ],
            "type": "u64"
          },
          {
            "name": "activeListings",
            "docs": [
              "Current active listings count"
            ],
            "type": "u16"
          },
          {
            "name": "volumeAsMaker",
            "docs": [
              "Total volume as maker (in lamports)"
            ],
            "type": "u128"
          },
          {
            "name": "volumeAsTaker",
            "docs": [
              "Total volume as taker (in lamports)"
            ],
            "type": "u128"
          },
          {
            "name": "totalFeesPaid",
            "docs": [
              "Total fees paid"
            ],
            "type": "u64"
          },
          {
            "name": "defaultListingDuration",
            "docs": [
              "Default listing duration (seconds)"
            ],
            "type": "i64"
          },
          {
            "name": "defaultSlippageBps",
            "docs": [
              "Default slippage tolerance (basis points)"
            ],
            "type": "u16"
          },
          {
            "name": "createdAt",
            "docs": [
              "Account creation timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "lastActivityAt",
            "docs": [
              "Last activity timestamp"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userProfileCreated",
      "docs": [
        "Emitted when a user profile is created"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "referrer",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
