#!/bin/bash

####### Pour GNU/Linux
cd ~/src/snap/snap4thymio/
#./asebascratch -v -a ./thymio_motion.aesl
asebahttp  --aesl ./thymio_motion.aesl -s 33333 "ser:name=Thymio-II"
#asebahttp2  --aesl ./thymio_motion.aesl -s 33333 "ser:name=Thymio-II"


########## Pour MACOSX
#cd ~/snap/snap4thymio/thymio_motion.aesl
#/Applications/Aseba/bin/asebahttp --aesl ./thymio_motion.aesl -s 33333 "ser:name=Thymio-II"
