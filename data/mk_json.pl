use strict;
use warnings;
use JSON;
use Data::Dumper;

my @data = ();
my $typhoon = {};
while(<STDIN>) {
    chomp;
    my $line = $_;
    if ($line =~ /^6666/) {
        push @data, $typhoon if $typhoon->{"header"};
        $line =~ s/\s+/,/g;
        my @header = split ",", $line;
        my @track = ();
        $typhoon = {
            "header" => \@header,
            "track" => \@track,
        };
    } else {
        $line =~ s/\s+/,/g;
        my @tmp = split(",", $line);
        push @{$typhoon->{track}}, \@tmp;
    }
}
push @data, $typhoon;

my $json = JSON->new;
print $json->encode(\@data);
