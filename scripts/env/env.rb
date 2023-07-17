# frozen_string_literal: true

require './scripts/env/config'
require './scripts/elements/platform'

def command_exists(command)
  require 'open3'
  _stdout, _stderr, status = Open3.capture3(command)
  status.success?
end

namespace :environment do
  desc 'check that all needed tools are installed'
  task :check do
    check_rust
    check_nj_cli
    check_wasm_pack
    check_yarn
    Reporter.done('Env', 'checking environment', '')
  end

  desc 'list info of needed tools'
  task :list do
    Shell.sh 'nj-cli -V'
    Shell.sh 'yarn -v'
    # put back in when wasm-pack supports the version again
    # Shell.sh 'wasm-pack -V'
    Shell.sh 'node -v'
    Shell.sh 'rustc -V'
  end
end

def check_yarn
  return if command_exists('yarn -v')

  Shell.sh 'npm install --global yarn'
  Reporter.done('Env', 'yarn is installed', '')
end

def check_rust
  config = Config.new
  return if config.get_rust_version == 'stable'

  output = `rustc -V`
  return if output.include? config.get_rust_version

  Shell.sh "rustup install #{config.get_rust_version}"
  Shell.sh "rustup default #{config.get_rust_version}"
  Reporter.done('Env', "Installed rust (#{config.get_rust_version})", '')
end

def check_nj_cli
  return if command_exists('nj-cli -V')

  Shell.sh 'cargo install nj-cli'
  Reporter.done('Env', 'nj-cli is installed', '')
end

def check_wasm_pack
  return if command_exists('wasm-pack --help')

  Shell.sh 'cargo install wasm-pack'
  Reporter.done('Env', 'wasm-pack is installed', '')
end
