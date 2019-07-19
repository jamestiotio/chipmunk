#[cfg(test)]
mod tests {
    use crate::dlt_parse::*;
    use crate::dlt;
    use nom::IResult;

    #[test]
    fn test_dlt_message_parsing() {
        let raw1: Vec<u8> = vec![
            // storage header
            0x44, 0x4C, 0x54, 0x01, 0x56, 0xA2, 0x91, 0x5C, 0x9C, 0x91, 0x0B, 0x00, 0x45, 0x43,
            0x55, 0x31, // header
            0x3D, // header type 0b11 1101
            0x40, 0x00, 0xA2, 0x45, 0x43, 0x55, 0x31, // ecu id
            0x00, 0x00, 0x01, 0x7F, // session id
            0x00, 0x5B, 0xF7, 0x16, // timestamp
            // extended header
            0x51, // MSIN 0b101 0001 => verbose, MST log,
            0x06, // arg count
            0x56, 0x53, 0x6F, 0x6D, // app id VSom
            0x76, 0x73, 0x73, 0x64, // context id vssd
            // arguments
            // 0x00, 0x82, 0x00, 0x00, // type info 0b1000001000000000
            // 0x3A, 0x00,
            // 0x5B, 0x33, 0x38, 0x33, 0x3A, 0x20, 0x53, 0x65,
            // 0x72, 0x76, 0x69, 0x63, 0x65, 0x44, 0x69, 0x73, 0x63, 0x6F, 0x76, 0x65, 0x72, 0x79,
            // 0x55, 0x64, 0x70, 0x45, 0x6E, 0x64, 0x70, 0x6F, 0x69, 0x6E, 0x74, 0x28, 0x31, 0x36,
            // 0x30, 0x2E, 0x34, 0x38, 0x2E, 0x31, 0x39, 0x39, 0x2E, 0x31, 0x30, 0x32, 0x3A, 0x35,
            // 0x30, 0x31, 0x35, 0x32, 0x29, 0x5D, 0x20, 0x00,
            0x00, 0x82, 0x00, 0x00, // type info 0b1000001000000000
            0x0F, 0x00, // length
            0x50, 0x72, 0x6F, 0x63, 0x65, 0x73, 0x73, 0x4D, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65,
            0x00, // "ProcessMessage"
            0x00, 0x82, 0x00, 0x00, // type info 0b1000001000000000
            0x02, 0x00, // length
            0x3A, 0x00, // ":"
            0x23, 0x00, 0x00, 0x00, // type info 0b10000000001000010
            0x0D, 0x01, 0x00, 0x00, 0x00, 0x82, 0x00, 0x00, 0x03, 0x00, 0x3A, 0x20, 0x00, 0x00,
            0x82, 0x00, 0x00, 0x14, 0x00, 0x31, 0x36, 0x30, 0x2E, 0x34, 0x38, 0x2E, 0x31, 0x39,
            0x39, 0x2E, 0x31, 0x36, 0x2C, 0x33, 0x30, 0x35, 0x30, 0x31, 0x00,
        ];
        let raw2: Vec<u8> = vec![
            0x44, 0x4C, 0x54, 0x01, 0x56, 0xA2, 0x91, 0x5C, 0x9C, 0x91, 0x0B, 0x00, 0x45, 0x43,
            0x55, 0x31, 0x3D, 0x41, 0x00, 0xA9, 0x45, 0x43, 0x55, 0x31, 0x00, 0x00, 0x01, 0x7F,
            0x00, 0x5B, 0xF7, 0x16, 0x51, 0x09, 0x56, 0x53, 0x6F, 0x6D, 0x76, 0x73, 0x73, 0x64,
            0x00, 0x82, 0x00, 0x00, 0x3A, 0x00, 0x5B, 0x33, 0x38, 0x33, 0x3A, 0x20, 0x53, 0x65,
            0x72, 0x76, 0x69, 0x63, 0x65, 0x44, 0x69, 0x73, 0x63, 0x6F, 0x76, 0x65, 0x72, 0x79,
            0x55, 0x64, 0x70, 0x45, 0x6E, 0x64, 0x70, 0x6F, 0x69, 0x6E, 0x74, 0x28, 0x31, 0x36,
            0x30, 0x2E, 0x34, 0x38, 0x2E, 0x31, 0x39, 0x39, 0x2E, 0x31, 0x30, 0x32, 0x3A, 0x35,
            0x30, 0x31, 0x35, 0x32, 0x29, 0x5D, 0x20, 0x00, 0x00, 0x82, 0x00, 0x00, 0x0F, 0x00,
            0x50, 0x72, 0x6F, 0x63, 0x65, 0x73, 0x73, 0x4D, 0x65, 0x73, 0x73, 0x61, 0x67, 0x65,
            0x00, 0x00, 0x82, 0x00, 0x00, 0x02, 0x00, 0x3A, 0x00, 0x23, 0x00, 0x00, 0x00, 0x24,
            0x01, 0x00, 0x00, 0x00, 0x82, 0x00, 0x00, 0x06, 0x00, 0x3A, 0x20, 0x28, 0x30, 0x78,
            0x00, 0x42, 0x00, 0x01, 0x00, 0x36, 0x15, 0x00, 0x82, 0x00, 0x00, 0x04, 0x00, 0x2C,
            0x30, 0x78, 0x00, 0x42, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x82, 0x00, 0x00, 0x02,
            0x00, 0x29, 0x00,
        ];
        let res1: IResult<&[u8], Option<dlt::Message>> =
            dlt_message(&raw1[..], Some(dlt::LogLevel::Debug));
        println!("res1 was: {:?}", res1);
        let res2: IResult<&[u8], Option<dlt::Message>> = dlt_message(&raw2[..], None);
        println!("res was: {:?}", res2);
    }

}
