/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/rage.json`.
 */
export type Rage = {
  "address": "DUShtzhevyTnQLXQmQaT9EfjjjGhg26m6yXHav3vwe6Z",
  "metadata": {
    "name": "rage",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "buyToken",
      "discriminator": [
        138,
        127,
        14,
        91,
        38,
        87,
        115,
        105
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "The payer of the transaction and the signer"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "bondingCurveAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "tradingFeeAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  100,
                  105,
                  110,
                  103,
                  95,
                  102,
                  101,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "token0PayerAta",
          "writable": true
        },
        {
          "name": "token0Mint",
          "docs": [
            "Mint associated with the meme coin"
          ],
          "writable": true
        },
        {
          "name": "token0Program",
          "docs": [
            "SPL token program for the meme coin"
          ]
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Associated token program"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "lamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "harvestYield",
      "discriminator": [
        28,
        200,
        150,
        200,
        69,
        56,
        38,
        133
      ],
      "accounts": [
        {
          "name": "signer",
          "docs": [
            "The payer of the transaction and the signer"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "bondingCurveAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "tradingFeeAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  100,
                  105,
                  110,
                  103,
                  95,
                  102,
                  101,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "token0Mint",
          "docs": [
            "Mint associated with the meme coin"
          ],
          "writable": true
        },
        {
          "name": "token0Program",
          "docs": [
            "SPL token program for the meme coin"
          ]
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "token0Mint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  103,
                  105,
                  99,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "args.symbol"
              }
            ]
          }
        },
        {
          "name": "extraMetasAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  120,
                  116,
                  114,
                  97,
                  45,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116,
                  45,
                  109,
                  101,
                  116,
                  97,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "token0Program",
          "address": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
        },
        {
          "name": "bondingCurveAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "token0BondingCurveAta",
          "writable": true
        },
        {
          "name": "bondingCurveState",
          "docs": [
            "pda to store bonding curve state"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "tradingFeeAuth",
          "writable": true
        },
        {
          "name": "updateAuthority",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "tokenDecimals",
          "type": "u8"
        },
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "createMintAccountArgs"
            }
          }
        }
      ]
    },
    {
      "name": "proxyInitialize",
      "discriminator": [
        185,
        41,
        170,
        16,
        237,
        245,
        76,
        134
      ],
      "accounts": [
        {
          "name": "signer",
          "docs": [
            "The payer for the transaction"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "cpSwapProgram",
          "address": "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C"
        },
        {
          "name": "creator",
          "docs": [
            "Address paying to create the pool. Can be anyone"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "bondingCurveMint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "bondingCurveMint"
              }
            ]
          }
        },
        {
          "name": "ammConfig",
          "docs": [
            "Which config the pool belongs to."
          ]
        },
        {
          "name": "authority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  110,
                  100,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  95,
                  115,
                  101,
                  101,
                  100
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "poolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "ammConfig"
              },
              {
                "kind": "account",
                "path": "token0Mint"
              },
              {
                "kind": "account",
                "path": "token1Mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "token0Mint",
          "docs": [
            "Token_0 mint, the key must smaller then token_1 mint."
          ]
        },
        {
          "name": "token1Mint",
          "docs": [
            "Token_1 mint, the key must grater then token_0 mint."
          ]
        },
        {
          "name": "bondingCurveMint",
          "writable": true
        },
        {
          "name": "lpMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  108,
                  112,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "creatorToken0",
          "writable": true
        },
        {
          "name": "creatorToken1",
          "writable": true
        },
        {
          "name": "creatorLpToken",
          "writable": true
        },
        {
          "name": "token0Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "token1Vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              },
              {
                "kind": "account",
                "path": "token1Mint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "createPoolFee",
          "docs": [
            "create pool fee account"
          ],
          "writable": true,
          "address": "DNXgeM9EiiaAbaWvwjHj9fQQLAX5ZsfHyvmYUNRAdNC8"
        },
        {
          "name": "observationState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  98,
                  115,
                  101,
                  114,
                  118,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "poolState"
              }
            ],
            "program": {
              "kind": "account",
              "path": "cpSwapProgram"
            }
          }
        },
        {
          "name": "tokenProgram",
          "docs": [
            "Program to create mint account and mint tokens"
          ],
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "token0Program",
          "docs": [
            "Spl token program or token program 2022"
          ]
        },
        {
          "name": "token1Program",
          "docs": [
            "Spl token program or token program 2022"
          ]
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Program to create an ATA for receiving position NFT"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "docs": [
            "To create a new program account"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "docs": [
            "Sysvar for program account"
          ],
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "openTime",
          "type": "u64"
        }
      ]
    },
    {
      "name": "realloc",
      "discriminator": [
        138,
        139,
        3,
        51,
        58,
        130,
        86,
        208
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "The payer for the transaction"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "token0Mint"
        },
        {
          "name": "bondingCurveState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "token0Program",
          "docs": [
            "Spl token program for meme coin"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "sellToken",
      "discriminator": [
        109,
        61,
        40,
        187,
        230,
        176,
        135,
        174
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "bondingCurveAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "tradingFeeAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  100,
                  105,
                  110,
                  103,
                  95,
                  102,
                  101,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "token0Mint",
          "docs": [
            "Mint associated with the meme coin"
          ],
          "writable": true
        },
        {
          "name": "token0SellerAta",
          "writable": true
        },
        {
          "name": "token0Program",
          "docs": [
            "Token program"
          ]
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Associated token program"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "syncBondingCurve",
      "discriminator": [
        66,
        113,
        236,
        204,
        104,
        222,
        235,
        159
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "The payer of the transaction and the signer",
            "The payer for the transaction"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "bondingCurveAuth",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "bondingCurveState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "token0Mint"
              }
            ]
          }
        },
        {
          "name": "token0BondingCurveAta",
          "docs": [
            "Token account to which the tokens will be minted (created if needed)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bondingCurveAuth"
              },
              {
                "kind": "account",
                "path": "token0Program"
              },
              {
                "kind": "account",
                "path": "token0Mint"
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
          "name": "token0Mint",
          "docs": [
            "Mint associated with the meme coin"
          ],
          "writable": true
        },
        {
          "name": "token0Program",
          "docs": [
            "SPL token program for the meme coin"
          ]
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "docs": [
            "Associated token program"
          ],
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "ammConfig",
      "discriminator": [
        218,
        244,
        33,
        104,
        203,
        203,
        43,
        111
      ]
    },
    {
      "name": "bondingCurveState",
      "discriminator": [
        182,
        185,
        75,
        193,
        72,
        40,
        132,
        153
      ]
    }
  ],
  "events": [
    {
      "name": "createEvent",
      "discriminator": [
        27,
        114,
        169,
        77,
        222,
        235,
        99,
        118
      ]
    },
    {
      "name": "harvestEvent",
      "discriminator": [
        33,
        112,
        85,
        175,
        175,
        39,
        21,
        88
      ]
    },
    {
      "name": "raydiumEvent",
      "discriminator": [
        135,
        34,
        87,
        103,
        186,
        165,
        200,
        118
      ]
    },
    {
      "name": "swapEvent",
      "discriminator": [
        64,
        198,
        205,
        232,
        38,
        8,
        113,
        226
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientUserSupply",
      "msg": "Insufficient token balance"
    },
    {
      "code": 6001,
      "name": "insufficientFunds",
      "msg": "Insufficient SOL balance"
    },
    {
      "code": 6002,
      "name": "accountNotRentExempt",
      "msg": "Account is not rent-exempt"
    },
    {
      "code": 6003,
      "name": "bondingCurveComplete",
      "msg": "Bonding curve is complete"
    },
    {
      "code": 6004,
      "name": "bondingCurveNotComplete",
      "msg": "Bonding curve is incomplete"
    },
    {
      "code": 6005,
      "name": "insufficientBuyAmount",
      "msg": "Min buy amount is 0.0000001 SOL"
    },
    {
      "code": 6006,
      "name": "insufficientReserve",
      "msg": "Insufficient reserve balance"
    },
    {
      "code": 6007,
      "name": "invalidInput",
      "msg": "Invalid input"
    },
    {
      "code": 6008,
      "name": "unauthorizedSigner",
      "msg": "Unauthorized signer"
    },
    {
      "code": 6009,
      "name": "insufficientReward",
      "msg": "Insufficient reward balance"
    },
    {
      "code": 6010,
      "name": "firstAirdropAlreadyDispatched",
      "msg": "First airdrop already dispatched"
    },
    {
      "code": 6011,
      "name": "notApproved",
      "msg": "Not approved"
    },
    {
      "code": 6012,
      "name": "invalidAirdrop",
      "msg": "Invalid airdrop amount"
    },
    {
      "code": 6013,
      "name": "noPendingAirdrops",
      "msg": "No pending airdrops: all airdrops for this milestone have been claimed"
    },
    {
      "code": 6014,
      "name": "curveAlreadyInSync",
      "msg": "Curve already in sync: no missing supply to mint"
    },
    {
      "code": 6015,
      "name": "targetReserveTooLow",
      "msg": "Target reserve must be ≥ 0.3 SOL"
    },
    {
      "code": 6016,
      "name": "targetReserveTooHigh",
      "msg": "Target reserve must be ≤ 80 SOL"
    },
    {
      "code": 6017,
      "name": "dontMigrate",
      "msg": "Dont Migrate"
    }
  ],
  "types": [
    {
      "name": "ammConfig",
      "docs": [
        "Holds the current owner of the factory"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "docs": [
              "Bump to identify PDA"
            ],
            "type": "u8"
          },
          {
            "name": "disableCreatePool",
            "docs": [
              "Status to control if new pool can be create"
            ],
            "type": "bool"
          },
          {
            "name": "index",
            "docs": [
              "Config index"
            ],
            "type": "u16"
          },
          {
            "name": "tradeFeeRate",
            "docs": [
              "The trade fee, denominated in hundredths of a bip (10^-6)"
            ],
            "type": "u64"
          },
          {
            "name": "protocolFeeRate",
            "docs": [
              "The protocol fee"
            ],
            "type": "u64"
          },
          {
            "name": "fundFeeRate",
            "docs": [
              "The fund fee, denominated in hundredths of a bip (10^-6)"
            ],
            "type": "u64"
          },
          {
            "name": "createPoolFee",
            "docs": [
              "Fee for create a new pool"
            ],
            "type": "u64"
          },
          {
            "name": "protocolOwner",
            "docs": [
              "Address of the protocol fee owner"
            ],
            "type": "pubkey"
          },
          {
            "name": "fundOwner",
            "docs": [
              "Address of the fund fee owner"
            ],
            "type": "pubkey"
          },
          {
            "name": "padding",
            "docs": [
              "padding"
            ],
            "type": {
              "array": [
                "u64",
                16
              ]
            }
          }
        ]
      }
    },
    {
      "name": "bondingCurveState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "connectorWeight",
            "type": "f64"
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "initialSupply",
            "type": "u64"
          },
          {
            "name": "currentSupply",
            "type": "u64"
          },
          {
            "name": "targetSupply",
            "type": "u64"
          },
          {
            "name": "initialReserve",
            "type": "u64"
          },
          {
            "name": "currentReserve",
            "type": "u64"
          },
          {
            "name": "targetReserve",
            "type": "u64"
          },
          {
            "name": "tradingFees",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "status"
              }
            }
          }
        ]
      }
    },
    {
      "name": "createEvent",
      "docs": [
        "Emitted when new bonding curve is created"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "openTime",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "createMintAccountArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "harvestEvent",
      "docs": [
        "Emitted when new bonding curve is created"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "signer",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "lamports",
            "type": "u64"
          },
          {
            "name": "time",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "raydiumEvent",
      "docs": [
        "Emitted when a bonding curve reaches 100% and the token is deployed to raydium"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "openTime",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "status",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "funding"
          },
          {
            "name": "complete"
          },
          {
            "name": "migrated"
          }
        ]
      }
    },
    {
      "name": "swapEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "signer",
            "type": "pubkey"
          },
          {
            "name": "time",
            "type": "i64"
          },
          {
            "name": "price",
            "type": "f64"
          },
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "lamports",
            "type": "u64"
          },
          {
            "name": "rentAmount",
            "type": "u64"
          },
          {
            "name": "swapType",
            "type": {
              "defined": {
                "name": "swapType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "swapType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "buy"
          },
          {
            "name": "sell"
          }
        ]
      }
    }
  ]
};
