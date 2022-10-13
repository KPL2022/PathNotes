export interface LandingOption {

    name: string;
    accessToken: string;
}

export const currentOptions = [

    {
        name: 'journal',
        accessToken: 'test-token',
        icon: '/assets/flaticon/sn_mm.png'
    },
    {

        name: 'explore',
        accessToken: 'test-token',
        icon: '/assets/flaticon/sn_exp.png'
    },
    {

        name: 'version-notes',
        accessToken: 'test-token',
        icon: '/assets/flaticon/sn_v_notes.png'
    },
    {

        name: '',
        accessToken: 'test-token',
        icon: '/assets/flaticon/sn_to_landing.png'
    },
];